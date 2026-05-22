"use client";

import { motion } from "framer-motion";

const BASE_STEPS = [
  { status: "CREATED", label: "Transfer Created" },
  { status: "QUOTE_LOCKED", label: "Rate Locked" },
  { status: "INSTA_PAY_PROCESSING", label: "InstaPay Processing" },
  { status: "FX_CONVERSION", label: "FX Conversion" },
  { status: "BI_FAST_PROCESSING", label: "BI-FAST Processing" },
  { status: "SETTLED", label: "Settled" },
  { status: "MORPH_ANCHORED", label: "Proof Anchored" },
] as const;

function getSteps(sourceCurrency?: string) {
  if (sourceCurrency === "IDR") {
    return [
      BASE_STEPS[0], BASE_STEPS[1],
      BASE_STEPS[4], BASE_STEPS[3], BASE_STEPS[2],
      BASE_STEPS[5], BASE_STEPS[6],
    ];
  }
  return BASE_STEPS;
}

export function TransferTimeline({
  currentStatus,
  sourceCurrency,
}: {
  currentStatus: string;
  sourceCurrency?: string;
}) {
  const steps = getSteps(sourceCurrency);
  const currentIndex = steps.findIndex(
    (s) => s.status === currentStatus,
  );

  return (
    <div className="relative space-y-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex || (index === currentIndex && index === steps.length - 1);
        const isActive = index === currentIndex && !isCompleted;

        return (
          <motion.div
            key={step.status}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="flex items-start gap-4"
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "bg-accent text-accent-foreground animate-pulse"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? "✓" : isActive ? "⏳" : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-8 w-0.5 ${
                    isCompleted ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
            <div className="pt-1">
              <span
                className={`text-sm font-medium ${
                  isCompleted
                    ? "text-primary"
                    : isActive
                      ? "text-accent"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
