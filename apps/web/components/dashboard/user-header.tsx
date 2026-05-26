"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface UserHeaderProps {
  name: string;
  aftWalletAddress: string | null;
}

export function UserHeader({ name, aftWalletAddress }: UserHeaderProps) {
  const [addrVisible, setAddrVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!aftWalletAddress) return;
    await navigator.clipboard.writeText(aftWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [aftWalletAddress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3"
    >
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="font-semibold text-lg">{name}</p>
        {aftWalletAddress && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-muted-foreground/60">AFT Wallet:</span>
            <span className="font-mono text-[10px] text-muted-foreground/70 truncate max-w-[140px]">
              {addrVisible ? aftWalletAddress : `${aftWalletAddress.slice(0, 6)}...${aftWalletAddress.slice(-4)}`}
            </span>
            <button
              onClick={() => setAddrVisible(!addrVisible)}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label={addrVisible ? "Hide wallet address" : "Show wallet address"}
            >
              {addrVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
            <button
              onClick={handleCopy}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="Copy wallet address"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
