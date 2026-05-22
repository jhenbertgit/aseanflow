"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "₱12.4M+", label: "Total Transferred" },
  { value: "< 30s", label: "Avg Settlement" },
  { value: "847", label: "Chain Anchors" },
] as const;

export function StatsSection() {
  return (
    <section className="relative border-y border-[rgba(255,255,255,0.06)] bg-[rgba(15,22,41,0.5)] px-4 py-14">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-[#10b981] sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-[#94a3b8]">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
