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

export async function initUser(
  cookieToken: string,
): Promise<{ id: string; accountNumber: string; name: string; email: string }> {
  const res = await fetch(`/api/users/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cookieToken }),
  });

  if (!res.ok) {
    throw new Error(`User init failed: ${res.status}`);
  }

  return res.json();
}
