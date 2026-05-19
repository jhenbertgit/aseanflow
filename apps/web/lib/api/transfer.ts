import type {
  TransferDetailResponse,
  TransferResponse,
} from "@aseanflow/shared";

export async function createTransfer(
  amount: number,
  from: string = "PHP",
  to: string = "IDR",
  trackingCode?: string,
): Promise<TransferResponse> {
  const res = await fetch("/api/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, from, to, trackingCode }),
  });

  if (!res.ok) {
    throw new Error(`Transfer creation failed: ${res.status}`);
  }

  return res.json();
}

export async function getTransferByTrackingCode(
  trackingCode: string,
): Promise<TransferDetailResponse> {
  const res = await fetch(`/api/transfer/${trackingCode}`);

  if (!res.ok) {
    if (res.status === 404) throw new Error("Transfer not found");
    throw new Error(`Failed to fetch transfer: ${res.status}`);
  }

  return res.json();
}
