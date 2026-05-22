"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@aseanflow/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";
import { Input } from "@aseanflow/ui/components/input";

import { LoadingState } from "@/components/ui/loading-state";
import { RewardBadge } from "@/components/reward-badge";
import { useCreateTransfer, useQuote, useWallet } from "@/lib/api/hooks";
import { CURRENCY_SYMBOLS } from "@/lib/constants";

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;
const ETA_SECONDS = "~10 seconds";
const TRACKING_CODE_RE = /^TXN[A-Z0-9]{3,12}$/;

type Direction = "PHP_TO_IDR" | "IDR_TO_PHP";

export function QuoteCalculator() {
  const [amount, setAmount] = useState<number>(1000);
  const [trackingCode, setTrackingCode] = useState("");
  const [direction, setDirection] = useState<Direction>("PHP_TO_IDR");

  const from = direction === "PHP_TO_IDR" ? "PHP" : "IDR";
  const to = direction === "PHP_TO_IDR" ? "IDR" : "PHP";
  const sourceSymbol = CURRENCY_SYMBOLS[from];
  const targetSymbol = CURRENCY_SYMBOLS[to];

  const trackingCodeValid = !!trackingCode && TRACKING_CODE_RE.test(trackingCode);
  const { data: quote, isLoading, error: quoteError } = useQuote(
    amount,
    from,
    to,
    trackingCodeValid ? trackingCode : undefined,
  );
  const { data: wallet, isLoading: walletLoading } = useWallet(
    trackingCodeValid ? trackingCode : "",
  );
  const walletNotFound =
    trackingCodeValid && !walletLoading && wallet === null;
  const createTransfer = useCreateTransfer();

  const isAmountValid = amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  const isSubmitting = createTransfer.isPending;
  const trackingCodeInvalid = !!trackingCode && !trackingCodeValid;

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      setAmount(0);
      return;
    }
    const parsed = Number(raw);
    if (!isNaN(parsed) && parsed >= 0) {
      setAmount(parsed);
    }
  }

  function handleTrackingCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTrackingCode(e.target.value.trim());
  }

  function handleSwap() {
    setDirection((d) => (d === "PHP_TO_IDR" ? "IDR_TO_PHP" : "PHP_TO_IDR"));
  }

  function handleContinue() {
    if (!isAmountValid || isSubmitting) return;
    createTransfer.mutate({
      amount,
      from,
      to,
      trackingCode: trackingCode || undefined,
    });
  }

  const displayError = !isAmountValid && amount > 0;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          Send {from} → {to}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleSwap}
            title="Swap direction"
          >
            ⇅
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            You send ({from})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {sourceSymbol}
            </span>
            <Input
              id="amount"
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              value={amount || ""}
              onChange={handleAmountChange}
              className="text-lg pl-10"
              placeholder="Enter amount"
            />
          </div>
          {displayError && (
            <p className="text-sm text-destructive">
              Amount must be between {sourceSymbol}{MIN_AMOUNT} and{" "}
              {sourceSymbol}{MAX_AMOUNT.toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="trackingCode" className="text-sm font-medium">
            Tracking code (optional)
          </label>
          <Input
            id="trackingCode"
            type="text"
            value={trackingCode}
            onChange={handleTrackingCodeChange}
            placeholder="Enter tracking code for returning users"
          />
          {wallet && <RewardBadge balance={wallet.balance} />}
          {trackingCodeInvalid && (
            <p className="text-xs text-destructive">
              Invalid format. Expected: TXN + uppercase letters/numbers (e.g. TXNABC123XYZ).
            </p>
          )}
          {!trackingCodeInvalid && walletNotFound && (
            <p className="text-xs text-destructive">
              No wallet found for this tracking code.
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState size="sm" message="Getting live rate..." />
            </motion.div>
          )}

          {quoteError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-destructive py-4"
            >
              Failed to get quote. Please try again.
            </motion.div>
          )}

          {quote && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2 rounded-lg bg-muted/50 p-4"
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span>1 {from} = {quote.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {to}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span>{sourceSymbol} {quote.fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ETA</span>
                <span>{ETA_SECONDS}</span>
              </div>
              {quote.discount?.applied && (
                <div className="text-sm text-primary">
                  AFT Discount: -{quote.discount.percent}% fee (
                  {quote.discount.reason})
                </div>
              )}
              {quote.discount &&
                !quote.discount.applied &&
                quote.discount.threshold && (
                  <div className="text-sm text-muted-foreground">
                    {quote.discount.reason}{" "}
                    <span className="text-yellow-600">
                      ({quote.discount.balance?.toFixed(2) ?? "0"}/
                      {quote.discount.threshold} AFT)
                    </span>
                  </div>
                )}
              <hr className="border-border" />
              <div className="flex justify-between font-semibold">
                <span>They receive</span>
                <span>{targetSymbol} {quote.receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {createTransfer.error && (
          <p className="text-sm text-destructive text-center">
            Transfer failed. Please try again.
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleContinue}
          disabled={!isAmountValid || !quote || isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Continue Transfer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
