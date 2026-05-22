"use client";

import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { Button } from "@aseanflow/ui/components/button";
import { Badge } from "@aseanflow/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";

import { LoadingState } from "@/components/ui/loading-state";
import { MorphProof } from "@/components/morph-proof";
import { TransferTimeline } from "@/components/transfer-timeline";
import { WalletInfo } from "@/components/wallet-info";
import { useTransferStatus, useWallet } from "@/lib/api/hooks";
import { CURRENCY_SYMBOLS } from "@/lib/constants";

export default function TransferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: trackingCode } = use(params);
  const { data: transfer, isLoading, error } = useTransferStatus(trackingCode);
  const { data: wallet } = useWallet(trackingCode);

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Button asChild variant="ghost" size="sm">
          <Link href="/">← Back</Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Tracking: {trackingCode}
              {transfer && (
                <Badge
                  variant={
                    transfer.status === "MORPH_ANCHORED"
                      ? "default"
                      : "secondary"
                  }
                >
                  {transfer.status.replace(/_/g, " ")}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingState message="Loading transfer..." />
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 text-center"
                >
                  <p className="font-medium text-destructive">
                    Transfer not found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Invalid tracking code.
                  </p>
                </motion.div>
              )}

              {transfer && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You send</span>
                      <span>
                        {CURRENCY_SYMBOLS[transfer.sourceCurrency as keyof typeof CURRENCY_SYMBOLS]}
                        {Number(transfer.sendAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">They receive</span>
                      <span>
                        {CURRENCY_SYMBOLS[transfer.targetCurrency as keyof typeof CURRENCY_SYMBOLS]}
                        {Number(transfer.receiveAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span>
                        1 {transfer.sourceCurrency} ={" "}
                        {Number(transfer.exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{" "}
                        {transfer.targetCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee</span>
                      <span>{CURRENCY_SYMBOLS[transfer.sourceCurrency as keyof typeof CURRENCY_SYMBOLS]}{Number(transfer.fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <TransferTimeline currentStatus={transfer.status} sourceCurrency={transfer.sourceCurrency} />

                  {transfer.morphTxHash && (
                    <MorphProof txHash={transfer.morphTxHash} />
                  )}

                  {(transfer.status === "SETTLED" ||
                    transfer.status === "MORPH_ANCHORED") &&
                    transfer.walletAddress && (
                      <div className="space-y-2">
                        <WalletInfo
                          address={transfer.walletAddress}
                          balance={wallet?.balance ?? "0"}
                        />
                        <Button asChild variant="link" size="sm" className="px-0">
                          <Link href={`/rewards/${trackingCode}`}>
                            View all rewards →
                          </Link>
                        </Button>
                      </div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
