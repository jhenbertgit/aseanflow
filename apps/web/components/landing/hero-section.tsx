"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@aseanflow/ui/components/button";

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
            <Link href="/dashboard">Open Dashboard</Link>
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
      </motion.div>
    </section>
  );
}
