import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/services/prisma.service';
import { ethers } from 'ethers';
import { createCipheriv, randomBytes } from 'crypto';

const ERC20_ABI = [
  'function mint(address to, uint256 amount)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private provider: ethers.JsonRpcProvider | null = null;
  private tokenContract: ethers.Contract | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const tokenAddr = this.config.get<string>('REWARD_TOKEN_ADDRESS');
    if (tokenAddr) {
      this.provider = new ethers.JsonRpcProvider(
        this.config.get<string>(
          'MORPH_RPC_URL',
          'https://rpc-hoodi.morph.network',
        ),
        2910,
      );
      this.tokenContract = new ethers.Contract(
        tokenAddr,
        ERC20_ABI,
        this.provider,
      );
      this.logger.log(`Token contract initialized at ${tokenAddr}`);
    } else {
      this.logger.warn(
        'REWARD_TOKEN_ADDRESS not set — balance checks return "0"',
      );
    }
  }

  async createWallet() {
    const rawWallet = ethers.Wallet.createRandom();
    const encrypted = this.encryptPrivateKey(rawWallet.privateKey);

    const wallet = await this.prisma.wallet.create({
      data: {
        address: rawWallet.address,
        encryptedPrivateKey: encrypted,
      },
    });

    this.logger.log(`Created wallet ${wallet.address}`);
    return wallet;
  }

  async findByTrackingCode(trackingCode: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { trackingCode },
      include: { wallet: true },
    });

    if (!transfer) return null;

    if (transfer.wallet) return transfer.wallet;

    const wallet = await this.createWallet();
    await this.prisma.transfer.update({
      where: { id: transfer.id },
      data: { walletId: wallet.id },
    });

    return wallet;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.tokenContract) return '0';
    const bal = (await this.tokenContract.balanceOf(address)) as bigint;
    return ethers.formatEther(bal);
  }

  async getRewardHistory(walletId: string) {
    const transfers = await this.prisma.transfer.findMany({
      where: {
        walletId,
        rewardTxHash: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transfers.map((t) => ({
      transferCode: t.trackingCode,
      amount: t.rewardAmount?.toString() ?? '0',
      txHash: t.rewardTxHash,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  private encryptPrivateKey(privateKey: string): string {
    const key = Buffer.from(
      this.config.get<string>('WALLET_ENCRYPTION_KEY', ''),
      'hex',
    );
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const enc = Buffer.concat([
      cipher.update(privateKey, 'utf8'),
      cipher.final(),
    ]);
    return `${iv.toString('hex')}:${enc.toString('hex')}`;
  }
}
