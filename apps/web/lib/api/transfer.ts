import type { TransferResponse } from "@aseanflow/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function createTransfer(
  amount: number,
  from: string = "PHP",
  to: string = "IDR",
): Promise<TransferResponse> {
  const res = await fetch(`${API_BASE}/api/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, from, to }),
  });

  if (!res.ok) {
    throw new Error(`Transfer creation failed: ${res.status}`);
  }

  return res.json();
}
