import { Worker, Job } from "bullmq";
import { redisConnection } from "../queues/post.queue";
import { prisma } from "@reerts/database";

type PublishJob = { postId: string; scheduledAt: string };

export function initPostPublishWorker() {
  const worker = new Worker(
    "reerts-post-publish",
    async (job: Job<PublishJob>) => {
      const { postId, scheduledAt } = job.data;
      const scheduledDate = new Date(scheduledAt);
      // Old jobs do not identify the schedule they were created for. They may
      // refer to a post that has since been cancelled or rescheduled.
      if (!postId || !scheduledAt || Number.isNaN(scheduledDate.getTime())) return;

      // None of the bundled providers currently implements a real publish API.
      // Fail closed until per-account delivery tracking and real providers exist.
      // The conditional update also prevents stale jobs from changing a post.
      await prisma.post.updateMany({
        where: { id: postId, status: "SCHEDULED", scheduledAt: { equals: scheduledDate, lte: new Date() } },
        data: { status: "FAILED", failureReason: "Automatic publishing is unavailable: no real publishing provider is configured." },
      });
    },
    { connection: redisConnection, concurrency: 5 }
  );

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });
  return worker;
}
