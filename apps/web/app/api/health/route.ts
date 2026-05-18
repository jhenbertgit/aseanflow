import { NextResponse } from "next/server";

const API_BASE =
  process.env.API_BASE_URL || "http://localhost:3001";

export async function GET() {
  const res = await fetch(`${API_BASE}/api/health`);

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
