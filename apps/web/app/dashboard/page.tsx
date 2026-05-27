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
import { initUser } from "@/lib/api/user";

const SESSION_COOKIE = "af_session";

function getOrCreateCookie(): string {
  const cookies = document.cookie.split(";").reduce(
    (acc, c) => {
      const [k, v] = c.trim().split("=");
      acc[k] = v;
      return acc;
    },
    {} as Record<string, string>,
  );

  if (cookies[SESSION_COOKIE]) {
    return cookies[SESSION_COOKIE];
  }

  const token = crypto.randomUUID();
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${SESSION_COOKIE}=${token};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax${secure}`;
  return token;
}

export default function DashboardPage() {
  const [cookieToken, setCookieToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getOrCreateCookie();

    initUser(token)
      .then(() => setCookieToken(token))
      .catch((err) => {
        console.error("User init failed:", err);
        // User might already exist from previous session — try dashboard load
        setCookieToken(token);
      });
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
            onClick={() => {
              document.cookie = `${SESSION_COOKIE}=;path=/;max-age=0`;
              window.location.reload();
            }}
            className="text-sm text-primary underline"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <UserHeader name={dashboard.user.name} aftWalletAddress={dashboard.aftWalletAddress} />
      </motion.div>

      {/* Balance cards */}
      <BalanceCards wallets={dashboard.wallets} aftBalance={dashboard.aftBalance} aftWalletAddress={dashboard.aftWalletAddress} accountNumber={dashboard.user.accountNumber} latestTrackingCode={dashboard.recentTransfers[0]?.trackingCode} />

      {/* Quick send + Recent Activity side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <QuickSend
            userId={dashboard.user.id}
            accountNumber={dashboard.user.accountNumber}
            lastTrackingCode={dashboard.recentTransfers[0]?.trackingCode}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ActivityFeed transfers={dashboard.recentTransfers} />
        </motion.div>
      </div>

      {/* Transfer History full width */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <TransferHistory transfers={dashboard.recentTransfers} />
      </motion.div>
    </main>
  );
}
