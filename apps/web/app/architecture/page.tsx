"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@aseanflow/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";

import { ArchitectureDiagram } from "@/components/architecture-diagram";

export default function DemoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Button asChild variant="ghost" size="sm">
          <Link href="/">← Back</Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              ASEANFlow Architecture
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              SWIFT-free PHP → IDR cross-border payments. Direct local currency
              rails with async blockchain proof anchoring on Morph L2.
            </p>
          </CardHeader>
          <CardContent>
            <ArchitectureDiagram />
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
