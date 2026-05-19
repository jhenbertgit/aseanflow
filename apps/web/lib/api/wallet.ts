interface WalletInfo {
  address: string;
  balance: string;
  symbol: string;
}

interface RewardEvent {
  transferCode: string;
  amount: string;
  txHash: string;
  createdAt: string;
}

interface WalletHistoryResponse {
  rewards: RewardEvent[];
}

export type { WalletInfo, RewardEvent, WalletHistoryResponse };

export async function getWalletInfo(
  trackingCode: string,
): Promise<WalletInfo | null> {
  const res = await fetch(`/api/wallet/${trackingCode}`);

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch wallet: ${res.status}`);
  }

  return res.json();
}

export async function getWalletHistory(
  trackingCode: string,
): Promise<WalletHistoryResponse | null> {
  const res = await fetch(`/api/wallet/${trackingCode}/history`);

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch wallet history: ${res.status}`);
  }

  return res.json();
}
