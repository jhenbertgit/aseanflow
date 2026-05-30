"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@aseanflow/ui/components/button";
import { Card, CardContent } from "@aseanflow/ui/components/card";

import { LoadingState } from "@/components/ui/loading-state";
import { UserHeader } from "@/components/dashboard/user-header";
import { BalanceCards } from "@/components/dashboard/balance-cards";
import { QuickSend } from "@/components/dashboard/quick-send";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TransferHistory } from "@/components/dashboard/transfer-history";
import { useDashboard } from "@/lib/api/hooks";
import { initUser } from "@/lib/api/user";

const SESSION_COOKIE = "af_session";
const ONBOARDING_DISMISSED_KEY = "af_onboarding_dismissed";

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

interface OnboardingBannerProps {
  userName: string;
  accountNumber: string;
}

function OnboardingBanner({ userName, accountNumber }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 overflow-hidden relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              aria-label="Dismiss onboarding"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                  Welcome to ASEANFlow, {userName}!
                </h2>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Your account number is your identity. No passwords, no KYC. Just this code.
                </p>
              </div>
              <div className="bg-white dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Your Account Number
                </p>
                <p className="font-mono text-xl font-bold text-emerald-900 dark:text-emerald-100 tracking-wide">
                  {accountNumber}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                    1
                  </span>
                  <span>Enter amount below</span>
                </div>
                <span className="hidden sm:inline text-emerald-400 dark:text-emerald-600">&rarr;</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                    2
                  </span>
                  <span>Pick recipient</span>
                </div>
                <span className="hidden sm:inline text-emerald-400 dark:text-emerald-600">&rarr;</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>Share tracking code</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
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
      {/* Onboarding banner for new users (no transfers yet) */}
      {dashboard.totalTransfers === 0 && (
        <OnboardingBanner
          userName={dashboard.user.name}
          accountNumber={dashboard.user.accountNumber}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <UserHeader name={dashboard.user.name} aftWalletAddress={dashboard.aftWalletAddress} />
      </motion.div>

      {/* Balance cards */}
      <BalanceCards wallets={dashboard.wallets} aftBalance={dashboard.aftBalance} aftWalletAddress={dashboard.aftWalletAddress} accountNumber={dashboard.user.accountNumber} latestTrackingCode={dashboard.lastOutgoingTrackingCode ?? undefined} />

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
            lastTrackingCode={dashboard.lastOutgoingTrackingCode ?? undefined}
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
