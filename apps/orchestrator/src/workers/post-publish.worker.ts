import { Worker, Job } from "bullmq";
import { redisConnection } from "../queues/post.queue";
import { PostsRepository, AccountsRepository } from "@reerts/database";
import { getSocialProvider, SocialPlatformId } from "@reerts/integrations";

export function initPostPublishWorker() {
  const worker = new Worker(
    "reerts-post-publish",
    async (job: Job<{ postId: string }>) => {
      const { postId } = job.data;
      console.log(`[Orchestrator Worker] Processing post publication: ${postId}`);

      const post = await PostsRepository.findPostById(postId);
      if (!post) {
        throw new Error(`Post not found: ${postId}`);
      }

      if (post.status === "PUBLISHED") {
        console.log(`Post ${postId} is already published, skipping.`);
        return;
      }

      let platforms: SocialPlatformId[] = [];
      try {
        platforms = JSON.parse(post.platforms);
      } catch {
        platforms = ["x"];
      }

      const errors: string[] = [];

      for (const platformId of platforms) {
        try {
          const provider = getSocialProvider(platformId);
          const accounts = await AccountsRepository.findWorkspaceAccounts(post.workspaceId);
          const matchedAccount = accounts.find((a: any) => a.provider === platformId);

          if (!matchedAccount || !matchedAccount.accessToken) {
            throw new Error(`No connected active account found for ${platformId}`);
          }

          const result = await provider.publish(
            { accessToken: matchedAccount.accessToken },
            {
              text: post.content,
              title: post.title,
            }
          );

          if (!result.success) {
            errors.push(`${platformId}: ${result.error || "unknown error"}`);
          }
        } catch (err: any) {
          errors.push(`${platformId}: ${err.message}`);
        }
      }

      if (errors.length > 0 && errors.length === platforms.length) {
        await PostsRepository.markFailed(postId, errors.join(" | "));
        throw new Error(`Failed to publish post: ${errors.join(" | ")}`);
      } else {
        await PostsRepository.markPublished(postId);
        console.log(`[Orchestrator Worker] Successfully published post ${postId}`);
      }
    },
    { connection: redisConnection, concurrency: 5 }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
}

