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

  async initUser(cookieToken: string) {
    // Idempotent — return existing user
    const existing = await this.prisma.user.findUnique({
      where: { cookieToken },
      include: { wallets: true },
    });
    if (existing) {
      return {
        id: existing.id,
        accountNumber: existing.accountNumber,
        name: existing.name,
        email: existing.email,
      };
    }

    // Retry loop handles race condition on unique constraints
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const user = await this.prisma.$transaction(async (tx) => {
          // FOR UPDATE lock prevents concurrent account number reads
          const result = await tx.$queryRaw<Array<{ max: string | null }>>`
            SELECT MAX("accountNumber") as max FROM "users" FOR UPDATE
          `;

          let nextNum = 1;
          const maxVal = result[0]?.max;
          if (maxVal) {
            const num = parseInt(maxVal.replace('AF', ''), 10);
            if (!isNaN(num)) nextNum = num + 1;
          }
          const accountNumber = `AF${String(nextNum).padStart(10, '0')}`;

          const randomTag = Math.random().toString(36).substring(2, 8).toUpperCase();

          return tx.user.create({
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
        });

        return {
          id: user.id,
          accountNumber: user.accountNumber,
          name: user.name,
          email: user.email,
        };
      } catch (err) {
        // P2002 = unique constraint violation (race on accountNumber or cookieToken)
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          // If cookieToken collision, user was created by concurrent request
          const existingNow = await this.prisma.user.findUnique({
            where: { cookieToken },
          });
          if (existingNow) {
            return {
              id: existingNow.id,
              accountNumber: existingNow.accountNumber,
              name: existingNow.name,
              email: existingNow.email,
            };
          }
          // Otherwise retry — account number collision, next attempt will get new number
          continue;
        }
        throw err;
      }
    }
    throw new Error('Failed to create user after 3 attempts');
  }
}
