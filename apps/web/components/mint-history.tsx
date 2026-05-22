"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";

import { MORPH_EXPLORER } from "@/lib/constants";

interface RewardEvent {
  transferCode: string;
  amount: string;
  txHash: string;
  createdAt: string;
}

function formatTokenAmount(raw: string): string {
  const num = parseFloat(raw);
  if (isNaN(num)) return "0";
  if (num >= 1e15) return (num / 1e18).toFixed(2);
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toFixed(4).replace(/\.?0+$/, "");
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface MintHistoryProps {
  rewards: RewardEvent[];
  totalCount?: number;
  showAll?: boolean;
  onToggle?: () => void;
}

export function MintHistory({ rewards, totalCount, showAll, onToggle }: MintHistoryProps) {
  if (rewards.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          No reward transactions yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Reward History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rewards.map((reward) => (
          <div
            key={reward.txHash}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {formatTokenAmount(reward.amount)} AFT
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(reward.createdAt)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {reward.transferCode}
              </span>
            </div>
            <a
              href={`${MORPH_EXPLORER}/tx/${reward.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-mono text-xs text-muted-foreground hover:underline"
            >
              {reward.txHash.slice(0, 10)}...
            </a>
          </div>
        ))}
        {totalCount != null && totalCount > 3 && onToggle && (
          <button
            onClick={onToggle}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {showAll ? "Show less" : `Show all (${totalCount})`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
