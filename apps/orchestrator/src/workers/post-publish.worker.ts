import { Job, Worker } from "bullmq";
import { randomUUID } from "node:crypto";
import { prisma } from "@reerts/database";
import { publishGraph } from "@reerts/integrations";
import { redisConnection } from "../queues/post.queue";
import { openChannelToken } from "./token";

type PublishJob = { deliveryId: string; scheduledAt: string };

export async function finishDelivery(id: string, claimToken: string, externalPostId: string | null, failureReason: string | null) {
  await prisma.$transaction(async tx => {
    const delivery = await tx.postChannel.findUnique({ where: { id } });
    if (!delivery) return;
    await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${delivery.postId} FOR UPDATE`;
    const status = externalPostId ? "PUBLISHED" : "FAILED";
    const completedAt = new Date();
    const changed = await tx.postChannel.updateMany({ where: { id, claimToken, status: "PUBLISHING" },
      data: { status, claimToken: null, claimedUntil: null, failureReason, externalPostId, publishedAt: externalPostId ? completedAt : null } });
    if (!changed.count) return;
    await tx.publishingAttempt.update({ where: { deliveryId_attemptNumber: { deliveryId: id, attemptNumber: delivery.attemptCount } },
      data: { status, completedAt, error: failureReason, externalPostId } });
    const all = await tx.postChannel.findMany({ where: { postId: delivery.postId }, select: { status: true, failureReason: true } });
    if (all.some(d => d.status === "PENDING" || d.status === "PUBLISHING")) return;
    const failed = all.find(d => d.status === "FAILED");
    await tx.post.update({ where: { id: delivery.postId }, data: { status: failed ? "FAILED" : "PUBLISHED", failureReason: failed?.failureReason, publishedAt: failed ? null : completedAt } });
  });
}

async function deliver(job: Job<PublishJob>) {
  const { deliveryId: id, scheduledAt } = job.data;
  if (!id || !scheduledAt) return;
  const date = new Date(scheduledAt);
  if (!Number.isFinite(date.getTime()) || date.getTime() > Date.now()) return;
  const claimToken = randomUUID();
  const row = await prisma.$transaction(async tx => {
    const candidate = await tx.postChannel.findUnique({ where: { id }, select: { postId: true } });
    if (!candidate) return;
    await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${candidate.postId} FOR UPDATE`;
    const changed = await tx.postChannel.updateMany({ where: { id, status: "PENDING", scheduledAt: date,
      post: { status: { in: ["SCHEDULED", "PUBLISHING"] }, scheduledAt: date } },
      data: { status: "PUBLISHING", claimToken, claimedUntil: new Date(Date.now() + 120_000), attemptCount: { increment: 1 } } });
    if (!changed.count) return;
    const delivery = await tx.postChannel.findUniqueOrThrow({ where: { id }, include: { account: true, post: true } });
    await tx.post.update({ where: { id: delivery.postId }, data: { status: "PUBLISHING" } });
    await tx.publishingAttempt.create({ data: { deliveryId: id, attemptNumber: delivery.attemptCount, status: "PUBLISHING" } });
    return delivery;
  });
  if (!row) return;
  const heartbeat = setInterval(() => {
    void prisma.postChannel.updateMany({ where: { id, claimToken }, data: { claimedUntil: new Date(Date.now() + 120_000) } }).catch(() => console.error("Delivery lease renewal failed", id));
  }, 30_000);
  try {
    let remote: string | null = null;
    let error: string | null = null;
    try {
      const channel = row.account;
      if (channel.status !== "active" || (channel.expiresAt && channel.expiresAt <= new Date())) throw new Error("Reconnect the expired or inactive channel");
      remote = await publishGraph({ provider: channel.provider, externalId: JSON.parse(channel.metadata || "{}").externalId || channel.handle,
        token: openChannelToken(channel.accessToken), caption: row.content ?? row.post.content, assets: JSON.parse(row.post.mediaUrls) });
    } catch (cause) { error = cause instanceof Error ? cause.message : "Provider request failed"; }
    await finishDelivery(id, claimToken, remote, error);
  } finally { clearInterval(heartbeat); }
}

export function initPostPublishWorker() {
  const worker = new Worker("reerts-post-publish", deliver, { connection: redisConnection, concurrency: 5 });
  worker.on("failed", (job, error) => console.error("Delivery job failed", job?.id, error.message));
  return worker;
}
