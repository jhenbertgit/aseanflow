"use client";

import { Badge } from "@aseanflow/ui/components/badge";

interface RewardBadgeProps {
  balance: string;
}

function formatBalance(raw: string): string {
  const num = parseFloat(raw);
  if (isNaN(num)) return "0";
  if (num >= 1e15) return (num / 1e18).toFixed(2);
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(4).replace(/\.?0+$/, "");
}

export function RewardBadge({ balance }: RewardBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1">
      <span className="text-yellow-500">&#9679;</span>
      {formatBalance(balance)} AFT
    </Badge>
  );
}
