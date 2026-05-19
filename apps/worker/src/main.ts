import { Worker, Queue } from "bullmq";
import { processSettlement } from "./settlement.processor.js";
import { processMorphAnchor } from "./morph-anchor.processor.js";
import { processRewardMint } from "./reward-mint.processor.js";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6380,
};

const settlementWorker = new Worker("settlement", processSettlement, {
  connection,
  concurrency: 5,
});

const morphAnchorWorker = new Worker("morph-anchor", processMorphAnchor, {
  connection,
  concurrency: 3,
});

const rewardMintWorker = new Worker("reward-mint", processRewardMint, {
  connection,
  concurrency: 3,
});

settlementWorker.on("completed", (job) => {
  console.log(
    `[settlement] completed: ${job.id} -> ${JSON.stringify(job.returnvalue)}`,
  );

  // Queue morph-anchor after settlement completes
  const morphQueue = new Queue("morph-anchor", { connection });
  morphQueue
    .add("anchor", { transferId: job.returnvalue.transferId })
    .then(() => morphQueue.close())
    .catch((err) =>
      console.error("[settlement] failed to queue morph-anchor:", err),
    );

  // Queue reward-mint after settlement completes
  const rewardQueue = new Queue("reward-mint", { connection });
  rewardQueue
    .add("mint", { transferId: job.returnvalue.transferId })
    .then(() => rewardQueue.close())
    .catch((err) =>
      console.error("[settlement] failed to queue reward-mint:", err),
    );
});

settlementWorker.on("failed", (job, err) => {
  console.error(`[settlement] failed: ${job?.id} -> ${err.message}`);
});

morphAnchorWorker.on("completed", (job) => {
  console.log(
    `[morph-anchor] completed: ${job.id} -> ${JSON.stringify(job.returnvalue)}`,
  );
});

morphAnchorWorker.on("failed", (job, err) => {
  console.error(`[morph-anchor] failed: ${job?.id} -> ${err.message}`);
});

rewardMintWorker.on("completed", (job) => {
  console.log(
    `[reward-mint] completed: ${job.id} -> ${JSON.stringify(job.returnvalue)}`,
  );
});

rewardMintWorker.on("failed", (job, err) => {
  console.error(`[reward-mint] failed: ${job?.id} -> ${err.message}`);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down workers...");
  await settlementWorker.close();
  await morphAnchorWorker.close();
  await rewardMintWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down workers...");
  await settlementWorker.close();
  await morphAnchorWorker.close();
  await rewardMintWorker.close();
  process.exit(0);
});

console.log(`Workers started (settlement + morph-anchor + reward-mint)`);
console.log(`Redis: ${connection.host}:${connection.port}`);
