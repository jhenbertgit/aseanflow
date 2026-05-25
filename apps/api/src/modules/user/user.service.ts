import { Injectable } from '@nestjs/common';
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
        },
      },
    });

    if (!user) return null;

    return {
      user: {
        id: user.id,
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
    };
  }

  async findByCookieToken(cookieToken: string) {
    return this.prisma.user.findUnique({
      where: { cookieToken },
    });
  }
}
