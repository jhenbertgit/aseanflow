import type { Job } from "bullmq";
import { createHash } from "crypto";
import { ethers } from "ethers";
import type { PrismaClient } from "@aseanflow/database";
import { Prisma } from "@aseanflow/database";
import { enqueueTx } from "./morph-tx-queue.js";

const ERC20_ABI = [
  "function mint(address to, uint256 amount)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const REWARD_TOKEN_ADDRESS = process.env.REWARD_TOKEN_ADDRESS || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const MORPH_RPC =
  process.env.MORPH_RPC_URL || "https://rpc-hoodi.morph.network";
const MORPH_CHAIN_ID = Number(process.env.MORPH_CHAIN_ID || "2910");
const REWARD_AMOUNT = process.env.REWARD_AMOUNT || "10000000000000000000"; // 10 AFT
const MORPH_EXPLORER = "https://explorer-hoodi.morph.network";

let tokenContract: ethers.Contract | null = null;

function initToken(): void {
  if (!REWARD_TOKEN_ADDRESS || !DEPLOYER_PRIVATE_KEY) {
    console.warn(
      "[reward-mint] REWARD_TOKEN_ADDRESS or DEPLOYER_PRIVATE_KEY not set — mock mode",
    );
    return;
  }
  const provider = new ethers.JsonRpcProvider(MORPH_RPC, MORPH_CHAIN_ID);
  const signer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
  tokenContract = new ethers.Contract(REWARD_TOKEN_ADDRESS, ERC20_ABI, signer);
  console.log(`[reward-mint] Token: ${REWARD_TOKEN_ADDRESS}`);
  console.log(`[reward-mint] Signer: ${signer.address}`);
  console.log(`[reward-mint] Explorer: ${MORPH_EXPLORER}`);
}

initToken();

export function createRewardMintProcessor(prisma: PrismaClient) {
  return async function processRewardMint(
    job: Job<{ transferId: string }>,
  ): Promise<{ transferId: string; status: string; txHash?: string }> {
    const { transferId } = job.data;

    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: { wallet: true },
    });

    if (!transfer?.wallet) {
      job.log(`No wallet for transfer ${transferId} — skipping`);
      return { transferId, status: "SKIPPED" };
    }

    if (transfer.rewardTxHash) {
      job.log(`Already minted for transfer ${transferId}`);
      return { transferId, status: "ALREADY_MINTED" };
    }

    let txHash: string;

    if (tokenContract) {
      const result = await enqueueTx(async () => {
        const tx = await tokenContract!.mint(
          transfer.wallet!.address,
          REWARD_AMOUNT,
        );
        job.log(`Mint tx submitted: ${tx.hash}`);
        const receipt = await tx.wait(1);
        if (!receipt) throw new Error(`Mint tx ${tx.hash} failed — no receipt`);
        return tx.hash;
      });
      txHash = result;
      job.log(`Mint confirmed: ${MORPH_EXPLORER}/tx/${txHash}`);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      txHash =
        "0x" +
        createHash("sha256")
          .update(transferId + Date.now())
          .digest("hex");
      job.log(`Mock mint: ${txHash}`);
    }

    await prisma.transfer.update({
      where: { id: transferId },
      data: {
        rewardTxHash: txHash,
        rewardAmount: new Prisma.Decimal(REWARD_AMOUNT),
      },
    });

    job.log(`Transfer ${transferId} rewarded with 10 AFT`);
    return { transferId, status: "REWARDED", txHash };
  };
}

export default createRewardMintProcessor;
