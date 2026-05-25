import type { DashboardResponse } from "@aseanflow/shared";

export async function getDashboard(
  cookieToken: string,
): Promise<DashboardResponse> {
  const res = await fetch(`/api/dashboard/${cookieToken}`);

  if (!res.ok) {
    if (res.status === 404) throw new Error("User not found");
    throw new Error(`Dashboard fetch failed: ${res.status}`);
  }

  return res.json();
}
