import { Worker } from "bullmq";
import { automationQueue, redisConnection } from "../queues/post.queue";

export async function initAutoAnts() {
  const secret = process.env.AUTO_ANTS_SECRET;
  const origin = process.env.AUTO_ANTS_APP_URL;
  const workspace = process.env.AUTO_ANTS_WORKSPACE_ID;
  if (!origin || !workspace || !secret) return;
  if (secret.length < 32) throw new Error("AUTO_ANTS_SECRET requires 32 characters");
  const url = new URL("/api/automations/daily-pipeline/run", origin);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("Auto-Ants requires an HTTPS application URL");
  await automationQueue.add("auto-ants", { workspace }, {
    jobId: "auto-ants-" + workspace, repeat: { pattern: process.env.AUTO_ANTS_CRON || "0 8 * * *", tz: "UTC" },
    attempts: 3, backoff: { type: "exponential", delay: 60000 }, removeOnComplete: 20, removeOnFail: 50,
  });
  return new Worker(automationQueue.name, async job => {
    if (job.name !== "auto-ants" || job.data.workspace !== workspace) return;
    const res = await fetch(url, { method: "POST", headers: { Authorization: "Bearer " + secret, "Content-Type": "application/json" }, body: "{}", redirect: "error", signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error("Review draft generation returned HTTP " + res.status);
  }, { connection: redisConnection, concurrency: 1 });
}

