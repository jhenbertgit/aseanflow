"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@aseanflow/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@aseanflow/ui/components/card";

import type { TransferListItem } from "@aseanflow/shared";
import { CURRENCY_SYMBOLS } from "@/lib/constants";

interface TransferHistoryProps {
  transfers: TransferListItem[];
}

const INITIAL_COUNT = 7;

const STATUS_BADGE: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  QUOTE_LOCKED:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  INSTA_PAY_PROCESSING:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FX_CONVERSION:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  BI_FAST_PROCESSING:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SETTLED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  MORPH_ANCHORED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function TransferRow({ t, i }: { t: TransferListItem; i: number }) {
  const badge = STATUS_BADGE[t.status] ?? STATUS_BADGE.CREATED;
  const srcSym = CURRENCY_SYMBOLS[t.sourceCurrency as keyof typeof CURRENCY_SYMBOLS] ?? "";
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.03 }}
      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
    >
      <td className="py-2">
        <Link href={`/transfer/${t.trackingCode}`} className="font-mono text-xs text-primary hover:underline">
          {t.trackingCode}
        </Link>
      </td>
      <td className="py-2">{srcSym}{t.sendAmount.toLocaleString()} → {t.targetCurrency}</td>
      <td className="py-2">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${badge}`}>
          {formatStatus(t.status)}
        </span>
      </td>
      <td className="py-2 text-muted-foreground">{formatDate(t.createdAt)}</td>
    </motion.tr>
  );
}

function TransferCard({ t, i }: { t: TransferListItem; i: number }) {
  const badge = STATUS_BADGE[t.status] ?? STATUS_BADGE.CREATED;
  const srcSym = CURRENCY_SYMBOLS[t.sourceCurrency as keyof typeof CURRENCY_SYMBOLS] ?? "";
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
      <Link href={`/transfer/${t.trackingCode}`} className="block rounded-lg border p-3 hover:bg-muted/30 transition-colors">
        <div className="flex justify-between items-start mb-1">
          <span className="font-mono text-xs">{t.trackingCode}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${badge}`}>{formatStatus(t.status)}</span>
        </div>
        <p className="text-sm font-medium">{srcSym}{t.sendAmount.toLocaleString()} → {t.targetCurrency}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatDate(t.createdAt)}</p>
      </Link>
    </motion.div>
  );
}

export function TransferHistory({ transfers }: TransferHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = transfers.length > INITIAL_COUNT;
  const visible = expanded ? transfers : transfers.slice(0, INITIAL_COUNT);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Transfer History</CardTitle>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No transfers yet</p>
        )}

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left py-2 font-medium">Tracking</th>
                <th className="text-left py-2 font-medium">Amount</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t, i) => (
                <TransferRow key={t.trackingCode} t={t} i={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {visible.map((t, i) => (
            <TransferCard key={t.trackingCode} t={t} i={i} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show less" : `Show all (${transfers.length})`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
