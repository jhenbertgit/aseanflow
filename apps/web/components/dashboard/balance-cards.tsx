"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import type { AccountWalletResponse } from "@aseanflow/shared";

const CURRENCY_CONFIG: Record<
  string,
  { symbol: string; locale: string; color: string; accent: string }
> = {
  PHP: {
    symbol: "₱",
    locale: "en-PH",
    color: "from-emerald-500/10 to-emerald-600/5",
    accent: "text-emerald-500",
  },
  IDR: {
    symbol: "Rp",
    locale: "id-ID",
    color: "from-blue-500/10 to-blue-600/5",
    accent: "text-blue-500",
  },
  AFT: {
    symbol: "AFT ",
    locale: "en-US",
    color: "from-purple-500/10 to-purple-600/5",
    accent: "text-purple-500",
  },
};

function formatBalance(amount: string, currency: string): string {
  const config = CURRENCY_CONFIG[currency];
  if (!config) return amount;
  if (currency === "AFT") {
    const human = Number(amount) / 1e18;
    return new Intl.NumberFormat(config.locale, {
      maximumFractionDigits: 2,
    }).format(human);
  }
  const num = Number(amount);
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function MaskedId({ id }: { id: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [id]);

  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[10px] text-muted-foreground/70 truncate max-w-[100px]">
        {visible ? id : "••••••••"}
      </span>
      <button
        onClick={() => setVisible(!visible)}
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label={visible ? "Hide wallet ID" : "Show wallet ID"}
      >
        {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </button>
      <button
        onClick={handleCopy}
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label="Copy wallet ID"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

interface BalanceCardsProps {
  wallets: AccountWalletResponse[];
  aftBalance: string;
  aftWalletAddress: string | null;
  accountNumber: string;
}

export function BalanceCards({ wallets, aftBalance, aftWalletAddress, accountNumber }: BalanceCardsProps) {
  const allBalances = [
    ...wallets,
    { id: aftWalletAddress ?? "aft", currency: "AFT", balance: aftBalance },
  ];

  const [copied, setCopied] = useState(false);

  const handleCopyAccount = useCallback(async () => {
    await navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [accountNumber]);

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Account Number</span>
        <span className="font-mono text-sm font-semibold">{accountNumber}</span>
        <button
          onClick={handleCopyAccount}
          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="Copy account number"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {allBalances.map((wallet, i) => {
          const config = CURRENCY_CONFIG[wallet.currency];
          return (
            <motion.div
              key={wallet.currency}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`rounded-xl bg-gradient-to-br ${config?.color ?? "from-gray-500/10 to-gray-600/5"} border border-border/50 p-4`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">
                  {wallet.currency} Balance
                </p>
              </div>
              <MaskedId id={wallet.id} />
              <p className={`text-xl font-bold ${config?.accent ?? ""} mt-2`}>
                {config?.symbol}
                {formatBalance(wallet.balance, wallet.currency)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
