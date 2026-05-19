"use client";

import { Badge } from "@aseanflow/ui/components/badge";

interface RewardBadgeProps {
  balance: string;
}

export function RewardBadge({ balance }: RewardBadgeProps) {
  const num = parseFloat(balance);

  return (
    <Badge variant="secondary" className="gap-1">
      <span className="text-yellow-500">&#9679;</span>
      {num} AFT
    </Badge>
  );
}
