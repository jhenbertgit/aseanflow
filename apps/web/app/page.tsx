"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@aseanflow/ui/components/button";
import { Badge } from "@aseanflow/ui/components/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold">
          ASEANFlow — SWIFT-Free ASEAN Payments
        </h1>
        <p className="text-xl text-muted-foreground">
          Send PHP → IDR directly without SWIFT or USD
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
          <Link href="/demo">View Architecture</Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-2"
      >
        <Badge>Morph</Badge>
        <Badge variant="secondary">NestJS</Badge>
        <Badge variant="secondary">Docker</Badge>
        <Badge variant="secondary">Redis</Badge>
      </motion.div>
    </main>
  );
}
