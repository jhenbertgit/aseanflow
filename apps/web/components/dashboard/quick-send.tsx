"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@aseanflow/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";
import { Input } from "@aseanflow/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@aseanflow/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aseanflow/ui/components/select";

import { LoadingState } from "@/components/ui/loading-state";
import { useCreateTransfer, useQuote } from "@/lib/api/hooks";
import { CURRENCY_SYMBOLS } from "@/lib/constants";
import { INDONESIAN_BANKS, PHILIPPINE_BANKS } from "@aseanflow/shared";

type Direction = "PHP_TO_IDR" | "IDR_TO_PHP";
type RecipientMode = "WALLET" | "BANK";

interface QuickSendProps {
  userId?: string;
  accountNumber?: string;
  lastTrackingCode?: string;
}

export function QuickSend({ userId, accountNumber, lastTrackingCode }: QuickSendProps) {
  const [amount, setAmount] = useState<number>(1000);
  const [direction, setDirection] = useState<Direction>("PHP_TO_IDR");
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("WALLET");
  const [recipientAccountNumber, setRecipientAccountNumber] = useState("AF0000000000");
  const [recipientName, setRecipientName] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");

  const from = direction === "PHP_TO_IDR" ? "PHP" : "IDR";
  const to = direction === "PHP_TO_IDR" ? "IDR" : "PHP";
  const sourceSymbol = CURRENCY_SYMBOLS[from];
  const targetSymbol = CURRENCY_SYMBOLS[to];
  const bankList = to === "IDR" ? INDONESIAN_BANKS : PHILIPPINE_BANKS;

  const { data: quote, isLoading } = useQuote(amount, from, to);
  const createTransfer = useCreateTransfer();

  const isAmountValid = amount >= 1 && amount <= 1_000_000;
  const isSubmitting = createTransfer.isPending;

  const isSelfSend = recipientMode === "WALLET" && accountNumber && recipientAccountNumber.trim() === accountNumber;
  const isWalletRecipientValid = recipientAccountNumber.trim().length > 0;
  const isBankRecipientValid =
    recipientName.trim().length >= 2 &&
    recipientBank.length > 0 &&
    /^\d{6,20}$/.test(recipientAccount);
  const isRecipientValid =
    (recipientMode === "WALLET" ? isWalletRecipientValid : isBankRecipientValid) && !isSelfSend;

  function handleSwap() {
    setDirection((d) => (d === "PHP_TO_IDR" ? "IDR_TO_PHP" : "PHP_TO_IDR"));
    setRecipientBank("");
  }

  function handleSend() {
    if (!isAmountValid || !quote || isSubmitting || !isRecipientValid) return;
    createTransfer.mutate({
      amount,
      from,
      to,
      senderId: userId,
      trackingCode: lastTrackingCode || undefined,
      recipientType: recipientMode,
      quoteRate: quote.rate,
      quoteFee: quote.fee,
      quoteReceiveAmount: quote.receiveAmount,
      ...(recipientMode === "WALLET"
        ? { recipientWalletId: recipientAccountNumber.trim() }
        : {
            recipientName: recipientName.trim(),
            recipientBank,
            recipientAccount,
          }),
    });
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Quick Send
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-auto"
            onClick={handleSwap}
          >
            ⇅
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {sourceSymbol}
              </span>
              <Input
                type="number"
                min={1}
                max={1_000_000}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className={`pl-8 ${amount > 1_000_000 ? "border-destructive focus-visible:ring-destructive" : ""}`}
                placeholder="Amount"
              />
            </div>
            <div className="flex items-center text-muted-foreground text-sm shrink-0">
              → {to}
            </div>
          </div>
          {amount > 1_000_000 && (
            <p className="text-xs text-destructive">
              Max amount is {sourceSymbol}1,000,000
            </p>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {isLoading && !quote && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState size="sm" message="Rate..." />
            </motion.div>
          )}
          {quote && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-between text-sm rounded-lg bg-muted/50 px-3 py-2"
            >
              <span className="text-muted-foreground">They get</span>
              <span className="font-medium">
                {targetSymbol}{" "}
                {quote.receiveAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs
          value={recipientMode}
          onValueChange={(v) => setRecipientMode(v as RecipientMode)}
        >
          <TabsList className="w-full h-9 sm:h-8">
            <TabsTrigger value="WALLET" className="flex-1 text-sm sm:text-xs">
              Wallet
            </TabsTrigger>
            <TabsTrigger value="BANK" className="flex-1 text-sm sm:text-xs">
              Bank
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <AnimatePresence mode="wait">
          {recipientMode === "WALLET" ? (
            <motion.div
              key="wallet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Input
                value={recipientAccountNumber}
                onChange={(e) => setRecipientAccountNumber(e.target.value.trim())}
                placeholder="Account Number (e.g. AF0000000001)"
                className={isSelfSend ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {isSelfSend && (
                <p className="text-xs text-destructive">Cannot send to your own account</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="bank"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Recipient name"
                maxLength={100}
              />
              <Select value={recipientBank} onValueChange={setRecipientBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {bankList.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={recipientAccount}
                onChange={(e) =>
                  setRecipientAccount(
                    e.target.value.replace(/\D/g, "").slice(0, 20),
                  )
                }
                placeholder="Account number"
                maxLength={20}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          className="w-full"
          size="sm"
          onClick={handleSend}
          disabled={!isAmountValid || !quote || isSubmitting || !isRecipientValid}
        >
          {isSubmitting ? "Sending..." : "Send Now"}
        </Button>

        {createTransfer.error && (
          <p className="text-xs text-destructive text-center">
            {createTransfer.error instanceof Error && (createTransfer.error.message.includes("not found") || createTransfer.error.message.includes("own account"))
              ? createTransfer.error.message
              : "Transfer failed. Try again."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
