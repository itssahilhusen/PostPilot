import { prisma } from "@reerts/database";
import { initPostPublishWorker } from "./workers/post-publish.worker";
import { automationQueue, postQueue, redisConnection } from "./queues/post.queue";
import { initAutoAnts } from "./workers/auto-ants";

import { dispatch } from "./dispatch";

async function main() {
  const worker = initPostPublishWorker();
  const ants = await initAutoAnts();
  let stopping = false;
  process.once("SIGTERM", () => { stopping = true; });
  process.once("SIGINT", () => { stopping = true; });
  while (!stopping) {
    try { await dispatch(); } catch (error) { console.error("Schedule dispatch failed", error instanceof Error ? error.name : "Unknown error"); }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  await Promise.all([worker.close(), ants?.close()]);
  await Promise.all([postQueue.close(), automationQueue.close()]);
  await redisConnection.quit();
  await prisma.$disconnect();
}
void main().catch(error => { console.error("Orchestrator startup failed", error); process.exit(1); });
