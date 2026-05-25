"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { LoadingState } from "@/components/ui/loading-state";
import { UserHeader } from "@/components/dashboard/user-header";
import { BalanceCards } from "@/components/dashboard/balance-cards";
import { QuickSend } from "@/components/dashboard/quick-send";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TransferHistory } from "@/components/dashboard/transfer-history";
import { useDashboard } from "@/lib/api/hooks";

const DEMO_COOKIE = "af_session";
const DEMO_TOKEN = "af_demo_session_token_2026";

export default function SendPage() {
  const [cookieToken, setCookieToken] = useState<string | null>(null);

  useEffect(() => {
    const cookies = document.cookie.split(";").reduce(
      (acc, c) => {
        const [k, v] = c.trim().split("=");
        acc[k] = v;
        return acc;
      },
      {} as Record<string, string>,
    );

    if (cookies[DEMO_COOKIE]) {
      setCookieToken(cookies[DEMO_COOKIE]);
    } else {
      document.cookie = `${DEMO_COOKIE}=${DEMO_TOKEN};path=/;max-age=${60 * 60 * 24 * 365}`;
      setCookieToken(DEMO_TOKEN);
    }
  }, []);

  const { data: dashboard, isLoading, error } = useDashboard(cookieToken);

  if (isLoading || !cookieToken) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading dashboard..." />
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary underline"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <UserHeader name={dashboard.user.name} />
      </motion.div>

      {/* Balance cards */}
      <BalanceCards wallets={dashboard.wallets} />

      {/* Quick send */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <QuickSend />
      </motion.div>

      {/* Activity + History grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActivityFeed transfers={dashboard.recentTransfers} />
        <TransferHistory transfers={dashboard.recentTransfers} />
      </div>
    </main>
  );
}
