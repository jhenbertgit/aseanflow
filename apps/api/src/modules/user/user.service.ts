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

    // recipientWalletId stores account numbers (e.g. AF0000000001), not wallet IDs
    const accountNumbersToResolve = user.transfers
      .filter((t) => !t.recipientName && t.recipientWalletId)
      .map((t) => t.recipientWalletId);

    const recipientUsers = accountNumbersToResolve.length
      ? await this.prisma.user.findMany({
          where: { accountNumber: { in: accountNumbersToResolve } },
          select: { accountNumber: true, name: true },
        })
      : [];
    const recipientNameMap = new Map(
      recipientUsers.map((u) => [u.accountNumber, u.name]),
    );

    const incomingTransfers = await this.prisma.transfer.findMany({
      where: {
        recipientWalletId: user.accountNumber,
        senderId: { not: user.id },
      },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const outgoing = user.transfers.map((t) => ({
      trackingCode: t.trackingCode,
      status: t.status,
      sendAmount: Number(t.sendAmount),
      receiveAmount: Number(t.receiveAmount),
      sourceCurrency: t.sourceCurrency,
      targetCurrency: t.targetCurrency,
      fee: Number(t.fee),
      createdAt: t.createdAt.toISOString(),
      direction: 'outgoing' as const,
      senderName: user.name,
      recipientName:
        t.recipientName ??
        (t.recipientWalletId
          ? (recipientNameMap.get(t.recipientWalletId) ?? null)
          : null),
    }));

    const incoming = incomingTransfers.map((t) => ({
      trackingCode: t.trackingCode,
      status: t.status,
      sendAmount: Number(t.sendAmount),
      receiveAmount: Number(t.receiveAmount),
      sourceCurrency: t.sourceCurrency,
      targetCurrency: t.targetCurrency,
      fee: Number(t.fee),
      createdAt: t.createdAt.toISOString(),
      direction: 'incoming' as const,
      senderName: t.sender?.name ?? null,
      recipientName: user.name,
    }));

    const allTransfers = [...outgoing, ...incoming].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

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
      recentTransfers: allTransfers.slice(0, 50),
      totalTransfers: allTransfers.length,
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
          // Find highest account number — retry loop handles race conditions
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

          const randomTag = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

          return tx.user.create({
            data: {
              accountNumber,
              name: `User ${randomTag}`,
              email: `${randomTag.toLowerCase()}@aseanflow.auto`,
              cookieToken,
              wallets: {
                create: [
                  {
                    currency: 'PHP',
                    balance: new Prisma.Decimal('1000000.00'),
                  },
                  {
                    currency: 'IDR',
                    balance: new Prisma.Decimal('10000000.00'),
                  },
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
