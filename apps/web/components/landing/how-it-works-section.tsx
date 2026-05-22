"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: 1,
    title: "Enter Amount",
    desc: "Choose your PHP amount and see live IDR conversion",
  },
  {
    num: 2,
    title: "Lock Rate",
    desc: "Real-time FX rate locked for 30 seconds",
  },
  {
    num: 3,
    title: "Settle via BiFast",
    desc: "Instant settlement through Indonesia's BiFast network",
    badge: "Anchored on Morph",
  },
] as { num: number; title: string; desc: string; badge?: string }[];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowItWorksSection() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center text-2xl font-bold tracking-tight text-[#f1f5f9] sm:text-3xl"
        >
          How It Works
        </motion.h2>

        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center md:flex-1"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#10b981] bg-[#0a0f1a] text-sm font-bold text-[#10b981]">
                {step.num}
              </div>
              <h3 className="mb-1 text-base font-semibold text-[#f1f5f9]">
                {step.title}
              </h3>
              <p className="text-sm text-[#94a3b8]">{step.desc}</p>
              {step.badge && (
                <span className="mt-2 rounded-full bg-[rgba(251,191,36,0.15)] px-3 py-0.5 text-xs font-medium text-[#fbbf24]">
                  {step.badge}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
