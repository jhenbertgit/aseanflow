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

const TRACKING_CODE_RE = /^TXN[A-Z0-9]{9}$/;

export function HeroSection() {
  const [trackingCode, setTrackingCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleViewRewards(e: React.FormEvent) {
    e.preventDefault();
    const code = trackingCode.trim().toUpperCase();
    if (!code) {
      setError("Enter a tracking code");
      return;
    }
    if (!TRACKING_CODE_RE.test(code)) {
      setError("Invalid format — expected TXN + 9 characters");
      return;
    }
    setError("");
    router.push(`/rewards/${code}`);
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
          className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--text-muted)]"
        >
          Cross-Border Payments
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: "var(--text-primary)" }}
        >
          ASEAN<span style={{ color: "var(--accent-emerald)" }}>Flow</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-md text-sm text-[var(--text-muted)] sm:text-base"
        >
          SWIFT-Free PHP ↔ IDR Payments
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-[var(--accent-emerald)] text-white hover:bg-[var(--accent-emerald-dark)]">
            <Link href="/send">Send Money</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-[var(--border-glass)] bg-transparent text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
          >
            <Link href="/architecture">Architecture</Link>
          </Button>
        </motion.div>

        <motion.form
          onSubmit={handleViewRewards}
          variants={fadeUp}
          className="flex w-full max-w-sm items-center gap-2"
        >
          <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center gap-2">
              <Input
                value={trackingCode}
                onChange={(e) => {
                  setTrackingCode(e.target.value);
                  setError("");
                }}
                placeholder="Tracking code (TXN...)"
                className="flex-1 border-[var(--border-glass)] bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-[var(--accent-gold)] text-[var(--bg-deep)] hover:bg-[var(--accent-gold-light)]"
              >
                Rewards
              </Button>
            </div>
            {error && (
              <p className="px-1 text-xs text-destructive">{error}</p>
            )}
          </div>
        </motion.form>

        <motion.p
          variants={fadeUp}
          className="text-xs text-[var(--accent-gold)]"
        >
          Earn AFT reward tokens on every transfer ⭐
        </motion.p>
      </motion.div>
    </section>
  );
}
