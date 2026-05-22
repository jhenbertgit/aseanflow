"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@aseanflow/ui/components/button";
import { Input } from "@aseanflow/ui/components/input";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HeroSection() {
  const [trackingCode, setTrackingCode] = useState("");
  const router = useRouter();

  function handleViewRewards(e: React.FormEvent) {
    e.preventDefault();
    const code = trackingCode.trim();
    if (code) router.push(`/rewards/${code}`);
  }

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.p
          variants={fadeUp}
          className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#94a3b8]"
        >
          Cross-Border Payments
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: "#f1f5f9" }}
        >
          ASEAN<span style={{ color: "#10b981" }}>Flow</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-md text-sm text-[#94a3b8] sm:text-base"
        >
          SWIFT-Free PHP ↔ IDR Payments
        </motion.p>

        <motion.div variants={fadeUp} className="flex gap-3">
          <Button asChild size="lg" className="bg-[#10b981] text-white hover:bg-[#059669]">
            <Link href="/send">Send Money</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-[rgba(255,255,255,0.1)] bg-transparent text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f1f5f9]"
          >
            <Link href="/architecture">Architecture</Link>
          </Button>
        </motion.div>

        <motion.form
          onSubmit={handleViewRewards}
          variants={fadeUp}
          className="flex w-full max-w-xs items-center gap-2"
        >
          <Input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="Tracking code"
            className="flex-1 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#f1f5f9] placeholder:text-[#64748b]"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-[#fbbf24] text-[#0a0f1a] hover:bg-[#fcd34d]"
          >
            Rewards
          </Button>
        </motion.form>

        <motion.p
          variants={fadeUp}
          className="text-xs text-[#fbbf24]"
        >
          Earn AFT reward tokens on every transfer ⭐
        </motion.p>
      </motion.div>
    </section>
  );
}
