"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@aseanflow/ui/components/button";

export function CtaSection() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-md flex-col items-center gap-6 text-center"
      >
        <h2 className="text-2xl font-bold tracking-tight text-[#f1f5f9] sm:text-3xl">
          Start Sending Money Today
        </h2>
        <Button
          asChild
          size="lg"
          className="bg-[#10b981] px-8 text-white hover:bg-[#059669]"
        >
          <Link href="/send">Send Money</Link>
        </Button>
        <p className="text-sm text-[#fbbf24]">
          Earn AFT on every transfer ⭐
        </p>
      </motion.div>
    </section>
  );
}
