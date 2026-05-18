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
      className="rounded-lg border-2 border-green-500 bg-green-50 p-4 dark:bg-green-950/20"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">⛓️</span>
        <Badge className="bg-green-600 text-white">Verified on Morph</Badge>
      </div>
      <p className="mt-2 font-mono text-sm text-muted-foreground">
        {truncated}
      </p>
    </motion.div>
  );
}
