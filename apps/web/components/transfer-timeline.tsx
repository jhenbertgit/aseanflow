"use client";

import { motion } from "framer-motion";

const TIMELINE_STEPS = [
  { status: "CREATED", label: "Transfer Created" },
  { status: "QUOTE_LOCKED", label: "Rate Locked" },
  { status: "INSTA_PAY_PROCESSING", label: "InstaPay Processing" },
  { status: "FX_CONVERSION", label: "FX Conversion" },
  { status: "BI_FAST_PROCESSING", label: "BI-FAST Processing" },
  { status: "SETTLED", label: "Settled" },
  { status: "MORPH_ANCHORED", label: "Proof Anchored" },
] as const;

export function TransferTimeline({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const currentIndex = TIMELINE_STEPS.findIndex(
    (s) => s.status === currentStatus,
  );

  return (
    <div className="relative space-y-0">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex || (index === currentIndex && index === TIMELINE_STEPS.length - 1);
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
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : isActive ? "⏳" : index + 1}
              </div>
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`h-8 w-0.5 ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className="pt-1">
              <span
                className={`text-sm font-medium ${
                  isCompleted
                    ? "text-green-600"
                    : isActive
                      ? "text-blue-600"
                      : "text-gray-400"
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
