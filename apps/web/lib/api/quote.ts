import type { QuoteResponse } from "@aseanflow/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getQuote(
  amount: number,
  from: string = "PHP",
  to: string = "IDR",
): Promise<QuoteResponse> {
  const res = await fetch(`${API_BASE}/api/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, from, to }),
  });

  if (!res.ok) {
    throw new Error(`Quote failed: ${res.status}`);
  }

  return res.json();
}
