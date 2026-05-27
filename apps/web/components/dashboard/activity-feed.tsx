"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@aseanflow/ui/components/card";

import type { TransferListItem } from "@aseanflow/shared";

import { CURRENCY_SYMBOLS } from "@/lib/constants";

interface ActivityFeedProps {
  transfers: TransferListItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  CREATED: { label: "Created", color: "bg-gray-400", icon: "○" },
  QUOTE_LOCKED: { label: "Quote Locked", color: "bg-yellow-400", icon: "◐" },
  INSTA_PAY_PROCESSING: { label: "Processing", color: "bg-blue-400", icon: "◔" },
  FX_CONVERSION: { label: "Converting", color: "bg-indigo-400", icon: "◕" },
  BI_FAST_PROCESSING: { label: "Processing", color: "bg-blue-400", icon: "◔" },
  SETTLED: { label: "Settled", color: "bg-emerald-400", icon: "◉" },
  MORPH_ANCHORED: { label: "Anchored", color: "bg-emerald-500", icon: "●" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ transfers }: ActivityFeedProps) {
  const recent = transfers.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No transfers yet
          </p>
        )}
        {recent.map((t, i) => {
          const config = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.CREATED;
          const symbol = CURRENCY_SYMBOLS[t.sourceCurrency as keyof typeof CURRENCY_SYMBOLS] ?? "";
          return (
            <motion.div
              key={t.trackingCode}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Link
                href={`/transfer/${t.trackingCode}?direction=${t.direction}`}
                className="flex items-center gap-3 rounded-lg p-3 sm:p-2 hover:bg-muted/50 transition-colors"
              >
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {symbol}
                    {t.sendAmount.toLocaleString()} → {t.targetCurrency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.trackingCode}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${config.color}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(t.createdAt)}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
