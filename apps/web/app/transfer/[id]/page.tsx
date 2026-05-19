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

import { MorphProof } from "@/components/morph-proof";
import { TransferTimeline } from "@/components/transfer-timeline";
import { WalletInfo } from "@/components/wallet-info";
import { useTransferStatus } from "@/lib/api/hooks";

export default function TransferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: trackingCode } = use(params);
  const { data: transfer, isLoading, error } = useTransferStatus(trackingCode);

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
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading transfer...
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
                        ₱
                        {new Intl.NumberFormat("en-PH").format(
                          transfer.sendAmount,
                        )}{" "}
                        {transfer.sourceCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">They receive</span>
                      <span>
                        Rp{" "}
                        {new Intl.NumberFormat("id-ID").format(
                          transfer.receiveAmount,
                        )}{" "}
                        {transfer.targetCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span>
                        1 {transfer.sourceCurrency} ={" "}
                        {transfer.exchangeRate.toLocaleString()}{" "}
                        {transfer.targetCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee</span>
                      <span>₱{transfer.fee}</span>
                    </div>
                  </div>

                  <TransferTimeline currentStatus={transfer.status} />

                  {transfer.morphTxHash && (
                    <MorphProof txHash={transfer.morphTxHash} />
                  )}

                  {(transfer.status === "SETTLED" ||
                    transfer.status === "MORPH_ANCHORED") &&
                    transfer.walletAddress && (
                      <WalletInfo
                        address={transfer.walletAddress}
                        balance={transfer.rewardAmount ? transfer.rewardAmount : "0"}
                        symbol="AFT"
                      />
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
