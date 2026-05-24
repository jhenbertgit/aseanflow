"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Database,
  Server,
  Globe,
  Shield,
  Zap,
  Link2,
  Coins,
} from "lucide-react";

interface NodeProps {
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function Node({ label, sublabel, icon, color, delay = 0 }: NodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 150 }}
      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 ${color} px-3 py-2 sm:px-4 sm:py-3 shadow-sm`}
    >
      {icon}
      <span className="text-xs sm:text-sm font-semibold">{label}</span>
      {sublabel && (
        <span className="text-[10px] sm:text-xs text-muted-foreground">{sublabel}</span>
      )}
    </motion.div>
  );
}

function FlowArrow({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center rotate-90 sm:rotate-0"
    >
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </motion.div>
  );
}

const TECH_STACK = [
  { name: "Next.js 16", desc: "React 19 SSR frontend" },
  { name: "NestJS 10", desc: "Modular API backend" },
  { name: "Prisma v7", desc: "Type-safe PostgreSQL ORM" },
  { name: "BullMQ", desc: "Redis-based job queue" },
  { name: "Morph L2", desc: "Async blockchain proof" },
  { name: "Redis 7", desc: "FX rate cache + queue backend" },
  { name: "Docker", desc: "One-command deployment" },
  { name: "Tailwind v4", desc: "CSS-first styling" },
];

export function ArchitectureDiagram() {
  return (
    <div className="space-y-8">
      {/* Main flow diagram */}
      <div className="space-y-4">
        <h3 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Payment Flow
        </h3>

        {/* Row 1: User → Frontend → API → Payment Rails */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2">
          <Node
            label="User"
            sublabel="PHP sender"
            icon={<Globe className="h-5 w-5" />}
            color="border-blue-300 bg-blue-50 dark:bg-blue-950/20"
            delay={0}
          />
          <FlowArrow delay={0.2} />
          <Node
            label="Next.js"
            sublabel="React 19"
            icon={<Globe className="h-5 w-5" />}
            color="border-slate-300 bg-slate-50 dark:bg-slate-950/20"
            delay={0.3}
          />
          <FlowArrow delay={0.5} />
          <Node
            label="NestJS"
            sublabel="API :3001"
            icon={<Server className="h-5 w-5" />}
            color="border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
            delay={0.6}
          />
          <FlowArrow delay={0.8} />
          <Node
            label="BullMQ"
            sublabel="Settlement worker"
            icon={<Zap className="h-5 w-5" />}
            color="border-amber-300 bg-amber-50 dark:bg-amber-950/20"
            delay={0.9}
          />
        </div>

        {/* Row 2: InstaPay → FX → BI-FAST → Morph */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2">
          <Node
            label="InstaPay"
            sublabel="PHP rails"
            icon={<Shield className="h-5 w-5" />}
            color="border-purple-300 bg-purple-50 dark:bg-purple-950/20"
            delay={1.1}
          />
          <FlowArrow delay={1.3} />
          <Node
            label="FX Engine"
            sublabel="Redis cached rates"
            icon={<Zap className="h-5 w-5" />}
            color="border-orange-300 bg-orange-50 dark:bg-orange-950/20"
            delay={1.4}
          />
          <FlowArrow delay={1.6} />
          <Node
            label="BI-FAST"
            sublabel="IDR rails"
            icon={<Shield className="h-5 w-5" />}
            color="border-teal-300 bg-teal-50 dark:bg-teal-950/20"
            delay={1.7}
          />
          <FlowArrow delay={1.9} />
          <Node
            label="Morph"
            sublabel="Proof anchored"
            icon={<Link2 className="h-5 w-5" />}
            color="border-indigo-300 bg-indigo-50 dark:bg-indigo-950/20"
            delay={2.0}
          />
        </div>
      </div>

      {/* Reward flow */}
      <div className="space-y-3">
        <h3 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Reward Flow (AFT Token)
        </h3>
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2">
          <Node
            label="Transfer"
            sublabel="SETTLED state"
            icon={<Shield className="h-5 w-5" />}
            color="border-teal-300 bg-teal-50 dark:bg-teal-950/20"
            delay={2.05}
          />
          <FlowArrow delay={2.15} />
          <Node
            label="BullMQ Worker"
            sublabel="reward-mint job"
            icon={<Zap className="h-5 w-5" />}
            color="border-amber-300 bg-amber-50 dark:bg-amber-950/20"
            delay={2.25}
          />
          <FlowArrow delay={2.35} />
          <Node
            label="Mint AFT"
            sublabel="ERC-20 on Morph L2"
            icon={<Coins className="h-5 w-5" />}
            color="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20"
            delay={2.45}
          />
          <FlowArrow delay={2.55} />
          <Node
            label="Wallet"
            sublabel="Balance updated"
            icon={<Database className="h-5 w-5" />}
            color="border-indigo-300 bg-indigo-50 dark:bg-indigo-950/20"
            delay={2.65}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.75, duration: 0.4 }}
          className="rounded-lg border-2 border-dashed border-yellow-400 bg-yellow-50 p-4 text-center dark:bg-yellow-950/20"
        >
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            10 AFT per Transfer
          </p>
          <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
            Every settled transfer earns 10 AFT reward tokens. Hold AFT for fee
            discounts on future transfers. On-chain mint via Morph L2.
          </p>
        </motion.div>
      </div>

      {/* Data stores */}
      <div className="space-y-3">
        <h3 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Data Layer
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Node
            label="PostgreSQL"
            sublabel="Transfers + Ledger"
            icon={<Database className="h-5 w-5" />}
            color="border-sky-300 bg-sky-50 dark:bg-sky-950/20"
            delay={2.9}
          />
          <Node
            label="Redis"
            sublabel="Cache + Queue"
            icon={<Database className="h-5 w-5" />}
            color="border-red-300 bg-red-50 dark:bg-red-950/20"
            delay={3.1}
          />
        </div>
      </div>

      {/* Key differentiator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.3, duration: 0.4 }}
        className="rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-50 p-4 text-center dark:bg-emerald-950/20"
      >
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          SWIFT-Free Path
        </p>
        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
          No USD intermediary. PHP → InstaPay → FX → BI-FAST → IDR. Settlement
          in seconds, not days.
        </p>
      </motion.div>

      {/* Tech stack grid */}
      <div className="space-y-3">
        <h3 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Tech Stack
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TECH_STACK.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.5 + i * 0.08, duration: 0.3 }}
              className="rounded-lg border bg-card p-2.5 text-center"
            >
              <p className="text-sm font-medium">{tech.name}</p>
              <p className="text-xs text-muted-foreground">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
