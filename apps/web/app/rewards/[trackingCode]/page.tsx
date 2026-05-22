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

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button asChild variant="ghost" size="sm">
          <Link href="/">← Back</Link>
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
            {error && (
              <p className="text-sm text-destructive">Wallet not found</p>
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
