import { z } from 'zod';

export const CURRENCY_SYMBOLS = { PHP: '₱', IDR: 'Rp' } as const;
export const CURRENCY_NAMES = { PHP: 'Philippine Peso', IDR: 'Indonesian Rupiah' } as const;

export const CreateQuoteSchema = z
  .object({
    amount: z.number().positive().max(1000000),
    from: z.enum(['PHP', 'IDR']),
    to: z.enum(['PHP', 'IDR']),
    trackingCode: z.string().optional(),
  })
  .refine((data) => data.from !== data.to, {
    message: 'Source and target currencies must differ',
    path: ['to'],
  });

export const CreateTransferSchema = z
  .object({
    quoteId: z.string().optional(),
    amount: z.number().positive(),
    from: z.enum(['PHP', 'IDR']),
    to: z.enum(['PHP', 'IDR']),
    idempotencyKey: z.string().uuid().optional(),
    trackingCode: z.string().optional(),
    recipientType: z.enum(['WALLET', 'BANK']),
    recipientWalletId: z.string().optional(),
    recipientName: z.string().optional(),
    recipientBank: z.string().optional(),
    recipientAccount: z.string().optional(),
  })
  .refine((data) => data.from !== data.to, {
    message: 'Source and target currencies must differ',
    path: ['to'],
  })
  .refine(
    (data) =>
      data.recipientType === 'WALLET' ? !!data.recipientWalletId : true,
    {
      message: 'Wallet ID is required for wallet transfers',
      path: ['recipientWalletId'],
    },
  )
  .refine(
    (data) =>
      data.recipientType === 'BANK'
        ? !!data.recipientName && !!data.recipientBank && !!data.recipientAccount
        : true,
    {
      message: 'Recipient name, bank, and account are required for bank transfers',
      path: ['recipientName'],
    },
  );

export type CreateQuoteRequest = z.infer<typeof CreateQuoteSchema>;
export type CreateTransferRequest = z.infer<typeof CreateTransferSchema>;

export interface QuoteResponse {
  rate: number;
  fee: number;
  receiveAmount: number;
  timestamp: number;
  discount?: { applied: boolean; percent: number; reason: string; threshold?: number; balance?: number };
}

export interface TransferResponse {
  trackingCode: string;
  status: string;
}

export interface TransferDetailResponse {
  trackingCode: string;
  status: string;
  sendAmount: number;
  receiveAmount: number;
  exchangeRate: number;
  fee: number;
  sourceCurrency: string;
  targetCurrency: string;
  recipientType: 'WALLET' | 'BANK';
  recipientWalletId: string | null;
  recipientName: string | null;
  recipientBank: string | null;
  recipientAccount: string | null;
  senderName: string | null;
  senderAccountNumber: string | null;
  morphTxHash: string | null;
  walletAddress: string | null;
  rewardTxHash: string | null;
  rewardAmount: string | null;
  createdAt: string;
  updatedAt: string;
}

// Dashboard types

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
}

export interface AccountWalletResponse {
  id: string;
  currency: string;
  balance: string;
}

export interface TransferListItem {
  trackingCode: string;
  status: string;
  sendAmount: number;
  receiveAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  fee: number;
  createdAt: string;
  direction: 'outgoing' | 'incoming';
  senderName: string | null;
  senderAccountNumber: string | null;
  recipientName: string | null;
}

export interface DashboardResponse {
  user: UserResponse;
  wallets: AccountWalletResponse[];
  recentTransfers: TransferListItem[];
  totalTransfers: number;
  aftBalance: string;
  aftWalletAddress: string | null;
}
