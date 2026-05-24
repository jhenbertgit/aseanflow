"use client";

import { motion } from "framer-motion";

import { Badge } from "@aseanflow/ui/components/badge";

export function MorphProof({ txHash }: { txHash: string }) {
  const truncated = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="rounded-lg border-2 border-primary bg-primary/10 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-lg">⛓️</span>
        <Badge className="bg-primary text-primary-foreground">Verified on Morph</Badge>
      </div>
      <a
        href={`https://explorer-hoodi.morph.network/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block font-mono text-sm text-primary hover:underline"
      >
        {truncated} ↗
      </a>
    </motion.div>
  );
}
