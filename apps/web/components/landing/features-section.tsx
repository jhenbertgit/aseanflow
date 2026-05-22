"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "SWIFT-Free",
    desc: "No intermediary banks. Direct PHP to IDR corridor via Morph protocol.",
  },
  {
    icon: "📊",
    title: "Real-Time FX",
    desc: "Live exchange rates from Redis cache. Locked for 30 seconds per quote.",
  },
  {
    icon: "🔒",
    title: "Morph Anchor",
    desc: "Every settlement anchored on Morph L2. Cryptographic proof of finality.",
  },
  {
    icon: "⭐",
    title: "AFT Rewards",
    desc: "Earn reward tokens on every transfer. Fee discounts and wallet tracking.",
    gold: true,
  },
] as { icon: string; title: string; desc: string; gold?: boolean }[];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
        >
          Why ASEANFlow
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
              style={
                f.gold
                  ? { borderLeftColor: "var(--accent-gold)", borderLeftWidth: "3px" }
                  : undefined
              }
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
