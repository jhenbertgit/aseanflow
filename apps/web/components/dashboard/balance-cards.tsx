"use client";

import { motion } from "framer-motion";
import type { AccountWalletResponse } from "@aseanflow/shared";

interface BalanceCardsProps {
  wallets: AccountWalletResponse[];
}

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
};

function formatBalance(amount: string, currency: string): string {
  const config = CURRENCY_CONFIG[currency];
  if (!config) return amount;
  const num = Number(amount);
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function BalanceCards({ wallets }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {wallets.map((wallet, i) => {
        const config = CURRENCY_CONFIG[wallet.currency];
        return (
          <motion.div
            key={wallet.currency}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className={`rounded-xl bg-gradient-to-br ${config?.color ?? "from-gray-500/10 to-gray-600/5"} border border-border/50 p-4`}
          >
            <p className="text-xs text-muted-foreground mb-1">
              {wallet.currency} Balance
            </p>
            <p className={`text-xl font-bold ${config?.accent ?? ""}`}>
              {config?.symbol}
              {formatBalance(wallet.balance, wallet.currency)}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
