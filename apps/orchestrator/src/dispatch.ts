import { prisma } from "@reerts/database";
import { postQueue } from "./queues/post.queue";
import { finishDelivery } from "./workers/post-publish.worker";

// Pending rows are a transactional outbox. A Redis outage cannot lose a saved schedule.
export async function dispatch() {
  const now = new Date();
  const pending = await prisma.postChannel.findMany({ where: {
    status: "PENDING", scheduledAt: { not: null }, post: { status: { in: ["SCHEDULED", "PUBLISHING"] } },
    OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
  }, orderBy: [{ scheduledAt: "asc" }, { id: "asc" }], take: 200 });
  for (const d of pending) {
    if (!d.scheduledAt) continue;
    const time = d.scheduledAt.getTime();
    await postQueue.add("deliver", { deliveryId: d.id, scheduledAt: d.scheduledAt.toISOString() }, {
      jobId: `delivery-${d.id}-${time}`, delay: Math.max(0, time - Date.now()), removeOnComplete: true, removeOnFail: true,
    });
    await prisma.postChannel.updateMany({ where: { id: d.id, status: "PENDING", scheduledAt: d.scheduledAt },
      data: { nextAttemptAt: new Date(Date.now() + 60_000) } });
  }
  const expired = await prisma.postChannel.findMany({ where: { status: "PUBLISHING", claimedUntil: { lt: now } }, take: 100 });
  for (const d of expired) if (d.claimToken) await finishDelivery(d.id, d.claimToken, null, "Worker interrupted during publication. Check the channel before retrying.");
  await prisma.post.updateMany({ where: { status: "SCHEDULED", scheduledAt: { lte: now }, deliveries: { none: {} } },
    data: { status: "FAILED", failureReason: "No destination assigned. Select a channel and schedule again." } });
}

