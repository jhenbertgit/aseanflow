import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ASEANFlow Brand Utilities
 */
export const aseanflowColors = {
  primary: "#10B981",
  dark: "#064E3B",
  accent: "#34D399",
  success: "#22C55E",
  gradientStart: "#34D399",
  gradientEnd: "#10B981",
} as const;

/**
 * Generate ASEANFlow gradient background classes
 */
export function aseanflowGradient(
  direction:
    | "to-r"
    | "to-l"
    | "to-t"
    | "to-b"
    | "to-br"
    | "to-bl"
    | "to-tr"
    | "to-tl" = "to-r",
) {
  return `bg-gradient-${direction} from-aseanflow-gradient-start to-aseanflow-gradient-end`;
}

/**
 * ASEANFlow brand button variants
 */
export const aseanflowButtonVariants = {
  primary: "bg-aseanflow-primary hover:bg-aseanflow-dark text-white",
  secondary:
    "bg-aseanflow-accent hover:bg-aseanflow-primary text-white",
  gradient:
    "bg-gradient-to-r from-aseanflow-gradient-start to-aseanflow-gradient-end hover:from-aseanflow-dark hover:to-aseanflow-primary text-white",
} as const;
