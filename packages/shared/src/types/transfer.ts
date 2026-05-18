import { z } from 'zod';

export const CreateQuoteSchema = z.object({
  amount: z.number().positive().max(1000000),
  from: z.enum(['PHP']),
  to: z.enum(['IDR']),
});

export const CreateTransferSchema = z.object({
  quoteId: z.string().optional(),
  amount: z.number().positive(),
  from: z.enum(['PHP']),
  to: z.enum(['IDR']),
  idempotencyKey: z.string().uuid().optional(),
});

export type CreateQuoteRequest = z.infer<typeof CreateQuoteSchema>;
export type CreateTransferRequest = z.infer<typeof CreateTransferSchema>;

export interface QuoteResponse {
  rate: number;
  fee: number;
  receiveAmount: number;
  timestamp: number;
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
  morphTxHash: string | null;
  createdAt: string;
  updatedAt: string;
}
