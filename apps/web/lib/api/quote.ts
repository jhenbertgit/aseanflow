import type { QuoteResponse } from "@aseanflow/shared";

export async function getQuote(
  amount: number,
  from: string = "PHP",
  to: string = "IDR",
): Promise<QuoteResponse> {
  const res = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, from, to }),
  });

  if (!res.ok) {
    throw new Error(`Quote failed: ${res.status}`);
  }

  return res.json();
}
