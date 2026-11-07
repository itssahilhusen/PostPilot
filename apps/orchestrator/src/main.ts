import { initPostPublishWorker } from "./workers/post-publish.worker";
import { postQueue } from "./queues/post.queue";
import { PostsRepository } from "@reerts/database";

async function runScheduledScanner() {
  try {
    const duePosts = await PostsRepository.findScheduledPostsDue();
    for (const post of duePosts) {
      console.log(`[Orchestrator Scheduler] Queuing due post: ${post.id}`);
      await postQueue.add(`publish-${post.id}`, { postId: post.id });
      // Update status to prevent duplicate scheduling
      await PostsRepository.updateStatus(post.id, "SCHEDULED");
    }
  } catch (err) {
    console.error("[Orchestrator Scheduler] Error checking due posts:", err);
  }
}

async function bootstrap() {
  console.log("🚀 Starting Reerts Orchestrator Worker & Scheduler Service...");
  initPostPublishWorker();

  // Poll for scheduled posts every 30 seconds
  setInterval(runScheduledScanner, 30_000);
  await runScheduledScanner();
  console.log("✅ Reerts Orchestrator is running and listening for jobs.");
}

bootstrap().catch((err) => {
  console.error("Fatal error starting orchestrator:", err);
  process.exit(1);
});

