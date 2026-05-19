"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@aseanflow/ui/components/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-2xl font-bold sm:text-4xl">
          ASEANFlow — SWIFT-Free ASEAN Payments
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          Send PHP → IDR directly without SWIFT or USD
        </p>
        <p className="text-sm text-muted-foreground">
          Earn AFT reward tokens on every transfer
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4"
      >
        <Button asChild size="lg">
          <Link href="/send">Send Money</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/architecture">Architecture</Link>
        </Button>
      </motion.div>

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
    </main>
  );
}
