import { type NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.API_BASE_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API_BASE}/api/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
