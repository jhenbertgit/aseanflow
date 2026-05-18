export const TransferEvents = {
  STATUS_CHANGED: 'transfer.status.changed',
  SETTLED: 'transfer.settled',
} as const;

export interface TransferStatusChangedEvent {
  transferId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: number;
}

export interface TransferSettledEvent {
  transferId: string;
  trackingCode: string;
  timestamp: number;
}
