import { Injectable } from '@nestjs/common';
import { Prisma } from '@aseanflow/database';
import { PrismaService } from '../../common/services/prisma.service';

function generateAccountNumber(): string {
  const digits = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `AF${digits}`;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(cookieToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { cookieToken },
      include: {
        wallets: true,
        transfers: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { rewardWallet: { select: { id: true, address: true } } },
        },
      },
    });

    if (!user) return null;

    const aftWallet =
      user.transfers.find((t) => t.rewardWallet)?.rewardWallet ?? null;

    return {
      user: {
        id: user.id,
        accountNumber: user.accountNumber,
        name: user.name,
        email: user.email,
      },
      wallets: user.wallets.map((w) => ({
        id: w.id,
        currency: w.currency,
        balance: w.balance.toString(),
      })),
      recentTransfers: user.transfers.map((t) => ({
        trackingCode: t.trackingCode,
        status: t.status,
        sendAmount: Number(t.sendAmount),
        receiveAmount: Number(t.receiveAmount),
        sourceCurrency: t.sourceCurrency,
        targetCurrency: t.targetCurrency,
        fee: Number(t.fee),
        createdAt: t.createdAt.toISOString(),
      })),
      totalTransfers: user.transfers.length,
      aftBalance: user.transfers
        .filter((t) => t.rewardAmount !== null)
        .reduce(
          (sum, t) => sum.plus(t.rewardAmount!),
          new Prisma.Decimal(0),
        )
        .toString(),
      aftWalletAddress: aftWallet?.address ?? null,
    };
  }

  async findByCookieToken(cookieToken: string) {
    return this.prisma.user.findUnique({
      where: { cookieToken },
    });
  }
}
