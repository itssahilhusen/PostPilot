import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redisConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const postQueue = new Queue("reerts-post-publish", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const automationQueue = new Queue("reerts-automation", {
  connection: redisConnection,
});

