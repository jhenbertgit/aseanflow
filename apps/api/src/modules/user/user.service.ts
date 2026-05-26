import { Injectable } from '@nestjs/common';
import { Prisma } from '@aseanflow/database';
import { PrismaService } from '../../common/services/prisma.service';

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
        .reduce((sum, t) => sum.plus(t.rewardAmount), new Prisma.Decimal(0))
        .toString(),
      aftWalletAddress: aftWallet?.address ?? null,
    };
  }

  async findByCookieToken(cookieToken: string) {
    return this.prisma.user.findUnique({
      where: { cookieToken },
    });
  }

  async initUser(cookieToken: string) {
    // Check if user already exists with this cookieToken (idempotent)
    const existing = await this.prisma.user.findUnique({
      where: { cookieToken },
      include: { wallets: true },
    });
    if (existing) return existing;

    // Generate sequential account number inside transaction
    return this.prisma.$transaction(async (tx) => {
      const lastUser = await tx.user.findFirst({
        orderBy: { accountNumber: 'desc' },
        select: { accountNumber: true },
      });

      let nextNum = 1;
      if (lastUser?.accountNumber) {
        const num = parseInt(lastUser.accountNumber.replace('AF', ''), 10);
        if (!isNaN(num)) nextNum = num + 1;
      }
      const accountNumber = `AF${String(nextNum).padStart(10, '0')}`;

      const randomTag = Math.random().toString(36).substring(2, 8).toUpperCase();

      const user = await tx.user.create({
        data: {
          accountNumber,
          name: `User ${randomTag}`,
          email: `${randomTag.toLowerCase()}@aseanflow.auto`,
          cookieToken,
          wallets: {
            create: [
              { currency: 'PHP', balance: new Prisma.Decimal('1000000.00') },
              { currency: 'IDR', balance: new Prisma.Decimal('10000000.00') },
            ],
          },
        },
        include: { wallets: true },
      });

      return user;
    });
  }
}
