"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@aseanflow/ui/components/button";
import { Input } from "@aseanflow/ui/components/input";

export default function HomePage() {
  const [trackingCode, setTrackingCode] = useState("");
  const router = useRouter();

  function handleViewRewards(e: React.FormEvent) {
    e.preventDefault();
    const code = trackingCode.trim();
    if (code) router.push(`/rewards/${code}`);
  }

  return (
    <main className="fixed inset-0 top-16 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-1.5"
        >
          <h1 className="text-4xl font-bold sm:text-5xl tracking-tight">
            ASEANFlow
          </h1>
          <p className="text-sm text-muted-foreground sm:text-lg">
            SWIFT-Free PHP ↔ IDR Payments
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          <Button asChild size="lg">
            <Link href="/send">Send Money</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/architecture">Architecture</Link>
          </Button>
        </motion.div>

        <motion.form
          onSubmit={handleViewRewards}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex w-full max-w-xs items-center gap-2"
        >
          <Input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="Tracking code"
            className="flex-1"
          />
          <Button type="submit" variant="secondary" size="sm">
            Rewards
          </Button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground"
        >
          Earn AFT reward tokens on every transfer
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-1.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://img.shields.io/badge/Morph-Anchor-blue" alt="Morph" />
          <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white" alt="Next.js" />
          <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs&logoColor=white" alt="NestJS" />
          <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker" />
          <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis" />
        </motion.div>
      </div>
    </main>
  );
}
