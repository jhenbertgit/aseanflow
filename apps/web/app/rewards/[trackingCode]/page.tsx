"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@aseanflow/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";

import { LoadingState } from "@/components/ui/loading-state";
import { MintHistory } from "@/components/mint-history";
import { WalletInfo } from "@/components/wallet-info";
import { useWallet, useWalletHistory } from "@/lib/api/hooks";

export default function RewardsPage({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}) {
  const { trackingCode } = use(params);
  const { data: wallet, isLoading, error } = useWallet(trackingCode);
  const { data: history } = useWalletHistory(trackingCode);
  const [showAll, setShowAll] = useState(false);
  const notFound = !isLoading && (wallet === null || !!error);

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">← Back</Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AFT Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <LoadingState size="sm" />}
            {notFound && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <svg
                    className="h-6 w-6 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.773 4.773zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Transfer not found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No transfer exists with code &ldquo;{trackingCode}&rdquo;.
                    Make sure you copied it correctly.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Try a different code</Link>
                </Button>
              </div>
            )}
            {wallet && (
              <>
                <WalletInfo
                  address={wallet.address}
                  balance={wallet.balance}
                />
                {history && (
                  <MintHistory
                    rewards={
                      showAll
                        ? history.rewards
                        : history.rewards.slice(0, 3)
                    }
                    totalCount={history.rewards.length}
                    showAll={showAll}
                    onToggle={() => setShowAll((v) => !v)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
