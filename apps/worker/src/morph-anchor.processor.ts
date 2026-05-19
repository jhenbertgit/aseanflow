import type { Job } from "bullmq";
import { createHash } from "crypto";
import { ethers } from "ethers";
import { createPrismaClient } from "@aseanflow/database";
import { enqueueTx } from "./morph-tx-queue.js";

const prisma = createPrismaClient();

// Morph Hoodi Testnet
const MORPH_RPC =
  process.env.MORPH_RPC_URL || "https://rpc-hoodi.morph.network";
const MORPH_CHAIN_ID = Number(process.env.MORPH_CHAIN_ID || "2910");
const MORPH_PRIVATE_KEY = process.env.MORPH_PRIVATE_KEY || "";
const MORPH_EXPLORER = "https://explorer-hoodi.morph.network";

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;

function initMorph(): void {
  if (!MORPH_PRIVATE_KEY) {
    console.warn("[morph] MORPH_PRIVATE_KEY not set — using mock submission");
    return;
  }

  provider = new ethers.JsonRpcProvider(MORPH_RPC, MORPH_CHAIN_ID);
  wallet = new ethers.Wallet(MORPH_PRIVATE_KEY, provider);
  console.log(`[morph] Provider: ${MORPH_RPC} (chain ${MORPH_CHAIN_ID})`);
  console.log(`[morph] Wallet: ${wallet.address}`);
  console.log(`[morph] Explorer: ${MORPH_EXPLORER}`);
}

initMorph();

function generateProof(transfer: {
  id: string;
  sendAmount: { toString(): string };
  receiveAmount: { toString(): string };
  exchangeRate: { toString(): string };
  createdAt: Date;
}): string {
  const payload = JSON.stringify({
    transferId: transfer.id,
    amountPHP: transfer.sendAmount.toString(),
    amountIDR: transfer.receiveAmount.toString(),
    rate: transfer.exchangeRate.toString(),
    timestamp: Math.floor(new Date(transfer.createdAt).getTime() / 1000),
  });

  return createHash("sha256").update(payload).digest("hex");
}

async function submitToMorph(proofHash: string): Promise<{
  txHash: string;
  blockNumber?: number;
}> {
  if (wallet && provider) {
    return submitReal(proofHash);
  }
  return submitMock(proofHash);
}

async function submitReal(proofHash: string): Promise<{
  txHash: string;
  blockNumber: number;
}> {
  const proofBytes = "0x" + proofHash;

  const feeData = await provider!.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas
    ? (feeData.maxFeePerGas * 130n) / 100n
    : undefined;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
    ? (feeData.maxPriorityFeePerGas * 130n) / 100n
    : undefined;

  const tx = await wallet!.sendTransaction({
    to: wallet!.address,
    data: proofBytes,
    value: 0n,
    maxFeePerGas,
    maxPriorityFeePerGas,
  });

  console.log(`[morph] Tx submitted: ${tx.hash}, waiting confirmation...`);

  const receipt = await tx.wait(1);

  if (!receipt) {
    throw new Error(`Morph tx ${tx.hash} failed — no receipt`);
  }

  console.log(
    `[morph] Confirmed block ${receipt.blockNumber}: ${MORPH_EXPLORER}/tx/${tx.hash}`,
  );

  return {
    txHash: tx.hash,
    blockNumber: Number(receipt.blockNumber),
  };
}

async function submitMock(proofHash: string): Promise<{
  txHash: string;
  blockNumber: number;
}> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const txHash =
    "0x" +
    createHash("sha256")
      .update(proofHash + Date.now().toString())
      .digest("hex");

  return { txHash, blockNumber: Math.floor(Date.now() / 1000) };
}

export async function processMorphAnchor(
  job: Job<{ transferId: string }>,
): Promise<{ transferId: string; status: string; proofHash: string }> {
  const { transferId } = job.data;

  const transfer = await prisma.transfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error(`Transfer ${transferId} not found for morph anchoring`);
  }

  if (transfer.status !== "SETTLED") {
    throw new Error(
      `Transfer ${transferId} not SETTLED (current: ${transfer.status})`,
    );
  }

  const proofHash = generateProof(transfer);
  job.log(`Proof hash: ${proofHash}`);

  const result = await enqueueTx(() => submitToMorph(proofHash));
  job.log(`Morph tx: ${result.txHash}`);

  await prisma.transfer.update({
    where: { id: transferId },
    data: { status: "MORPH_ANCHORED", morphTxHash: result.txHash },
  });

  job.log(`Transfer ${transferId} → MORPH_ANCHORED`);

  return { transferId, status: "MORPH_ANCHORED", proofHash };
}

export default processMorphAnchor;
