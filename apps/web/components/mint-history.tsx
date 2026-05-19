"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";

const MORPH_EXPLORER = "https://explorer-hoodi.morph.network";

interface RewardEvent {
  transferCode: string;
  amount: string;
  txHash: string;
  createdAt: string;
}

interface MintHistoryProps {
  rewards: RewardEvent[];
}

export function MintHistory({ rewards }: MintHistoryProps) {
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
      <CardContent className="space-y-2">
        {rewards.map((reward) => (
          <div
            key={reward.txHash}
            className="flex items-center justify-between text-sm"
          >
            <div>
              <span className="text-muted-foreground">
                {reward.transferCode}
              </span>
              <span className="ml-2">{reward.amount} AFT</span>
            </div>
            <a
              href={`${MORPH_EXPLORER}/tx/${reward.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted-foreground hover:underline"
            >
              {reward.txHash.slice(0, 10)}...
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
