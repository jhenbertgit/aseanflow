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

import { useCreateTransfer, useQuote } from "@/lib/api/hooks";

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;
const ETA_SECONDS = "~10 seconds";

export function QuoteCalculator() {
  const [amount, setAmount] = useState<number>(1000);
  const { data: quote, isLoading, error: quoteError } = useQuote(amount);
  const createTransfer = useCreateTransfer();

  const isAmountValid = amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  const isSubmitting = createTransfer.isPending;

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

  function handleContinue() {
    if (!isAmountValid || isSubmitting) return;
    createTransfer.mutate(amount);
  }

  const displayError = !isAmountValid && amount > 0;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Send PHP → IDR</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            You send (PHP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₱
            </span>
            <Input
              id="amount"
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              value={amount || ""}
              onChange={handleAmountChange}
              className="pl-7 text-lg"
              placeholder="Enter amount"
            />
          </div>
          {displayError && (
            <p className="text-sm text-destructive">
              Amount must be between ₱{MIN_AMOUNT} and ₱
              {MAX_AMOUNT.toLocaleString()}
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
              className="text-center text-muted-foreground py-4"
            >
              Getting live rate...
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
                <span>1 PHP = {quote.rate.toLocaleString()} IDR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span>₱{quote.fee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ETA</span>
                <span>{ETA_SECONDS}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between font-semibold">
                <span>They receive</span>
                <span>Rp {quote.receiveAmount.toLocaleString()}</span>
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
