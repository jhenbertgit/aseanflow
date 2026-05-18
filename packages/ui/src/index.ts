// Export all components and utilities
export * from "./components";
export * from "./lib/utils";
export * from "./lib/accessibility";

// Re-export common utilities for easy access
export {
  cn,
  webgenixColors,
  webgenixGradient,
  webgenixButtonVariants,
} from "./lib/utils";
export {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  webgenixAccessibilityReport,
  logAccessibilityReport,
} from "./lib/accessibility";

// Re-export toast from sonner for convenience
export { toast } from "sonner";
