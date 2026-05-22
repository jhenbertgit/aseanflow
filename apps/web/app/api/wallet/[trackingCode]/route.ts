import { type NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.API_BASE_URL || "http://localhost:3001";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackingCode: string }> },
) {
  const { trackingCode } = await params;

  try {
    const res = await fetch(`${API_BASE}/api/wallet/${trackingCode}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Backend unavailable" },
      { status: 503 },
    );
  }
}
