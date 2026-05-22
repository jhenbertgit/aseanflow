"use client";

import { useState } from "react";

import { Button } from "@aseanflow/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";

import { MORPH_EXPLORER } from "@/lib/constants";
import { RewardBadge } from "./reward-badge";

interface WalletInfoProps {
  address: string;
  balance: string;
}

export function WalletInfo({ address, balance }: WalletInfoProps) {
  const [copied, setCopied] = useState(false);
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const explorerUrl = `${MORPH_EXPLORER}/address/${address}`;

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Reward Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm hover:underline"
          >
            {truncated}
          </a>
          <Button variant="ghost" size="sm" onClick={copyAddress}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <RewardBadge balance={balance} />
      </CardContent>
    </Card>
  );
}
