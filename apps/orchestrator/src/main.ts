import { initPostPublishWorker } from "./workers/post-publish.worker";
import { postQueue } from "./queues/post.queue";
import { PostsRepository } from "@reerts/database";

async function runScheduledScanner() {
  try {
    const duePosts = await PostsRepository.findScheduledPostsDue();
    for (const post of duePosts) {
      if (!post.scheduledAt) continue;
      const scheduledAt = post.scheduledAt.toISOString();
      await postQueue.add("publish", { postId: post.id, scheduledAt }, {
        jobId: `post-${post.id}-${post.scheduledAt.getTime()}`,
      });
    }
  } catch (err) {
    console.error("[Orchestrator Scheduler] Error checking due posts:", err);
  }
}

async function bootstrap() {
  initPostPublishWorker();
  setInterval(runScheduledScanner, 30_000);
  await runScheduledScanner();
  console.log("Orchestrator is running and listening for jobs.");
}

bootstrap().catch((err) => {
  console.error("Fatal error starting orchestrator:", err);
  process.exit(1);
});
