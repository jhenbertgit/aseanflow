import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { ethers } from 'ethers';
import { PrismaService } from '../../common/services/prisma.service';

export interface AnchorResult {
  proofHash: string;
  txHash: string;
  blockNumber?: number;
}

// Morph Hoodi Testnet
const MORPH_HOODI_RPC = 'https://rpc-hoodi.morph.network';
const MORPH_HOODI_CHAIN_ID = 2910;
const MORPH_HOODI_EXPLORER = 'https://explorer-hoodi.morph.network';

@Injectable()
export class MorphService {
  private readonly logger = new Logger(MorphService.name);
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.initProvider();
  }

  private initProvider(): void {
    const rpcUrl = this.config.get<string>('MORPH_RPC_URL', MORPH_HOODI_RPC);
    const privateKey = this.config.get<string>('MORPH_PRIVATE_KEY', '');
    const chainId = this.config.get<string>(
      'MORPH_CHAIN_ID',
      String(MORPH_HOODI_CHAIN_ID),
    );

    if (!privateKey) {
      this.logger.warn(
        'MORPH_PRIVATE_KEY not set — anchoring will use mock mode',
      );
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl, Number(chainId));
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.logger.log(
        `Morph provider initialized: ${rpcUrl} (chain ${chainId})`,
      );
      this.logger.log(`Wallet address: ${this.wallet.address}`);
      this.logger.log(`Explorer: ${MORPH_HOODI_EXPLORER}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to init Morph provider: ${msg}`);
      this.provider = null;
      this.wallet = null;
    }
  }

  generateProof(transfer: {
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

    return createHash('sha256').update(payload).digest('hex');
  }

  async anchorProof(transferId: string): Promise<AnchorResult> {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found for morph anchoring`);
    }

    if (transfer.status !== 'SETTLED') {
      throw new Error(
        `Transfer ${transferId} not SETTLED (current: ${transfer.status})`,
      );
    }

    const proofHash = this.generateProof(transfer);
    const anchorResult = await this.submitToMorph(proofHash);

    await this.prisma.transfer.update({
      where: { id: transferId },
      data: { morphTxHash: anchorResult.txHash },
    });

    this.logger.log(
      `Anchored proof for transfer ${transferId}: ${anchorResult.txHash}`,
    );

    return anchorResult;
  }

  private async submitToMorph(proofHash: string): Promise<AnchorResult> {
    // Real testnet submission when wallet configured
    if (this.wallet && this.provider) {
      return this.submitReal(proofHash);
    }

    // Fallback: mock submission
    this.logger.warn('No Morph wallet configured — using mock submission');
    return this.submitMock(proofHash);
  }

  private async submitReal(proofHash: string): Promise<AnchorResult> {
    if (!this.wallet) throw new Error('Wallet not initialized');
    const proofBytes = '0x' + proofHash;

    const tx = await this.wallet.sendTransaction({
      to: this.wallet.address,
      data: proofBytes,
      value: 0n,
    });

    this.logger.log(`Tx submitted: ${tx.hash}, waiting for confirmation...`);

    const receipt = await tx.wait(1);

    if (!receipt) {
      throw new Error(`Morph tx ${tx.hash} failed — no receipt`);
    }

    this.logger.log(
      `Tx confirmed in block ${receipt.blockNumber}: ${MORPH_HOODI_EXPLORER}/tx/${tx.hash}`,
    );

    return {
      proofHash,
      txHash: tx.hash,
      blockNumber: Number(receipt.blockNumber),
    };
  }

  private async submitMock(proofHash: string): Promise<AnchorResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const txHash =
      '0x' +
      createHash('sha256')
        .update(proofHash + Date.now().toString())
        .digest('hex');

    return { proofHash, txHash, blockNumber: Math.floor(Date.now() / 1000) };
  }
}
