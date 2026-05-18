import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Aseanflow Brand Utilities
 */
export const webgenixColors = {
  purple: "#7C3AED",
  deepPurple: "#5B21B6",
  lightPurple: "#A78BFA",
  white: "#FFFFFF",
  darkGray: "#374151",
  gradientStart: "#8B5CF6",
  gradientEnd: "#7C3AED",
} as const;

/**
 * Generate Aseanflow gradient background classes
 */
export function webgenixGradient(
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
  return `bg-gradient-${direction} from-webgenix-gradient-start to-webgenix-gradient-end`;
}

/**
 * Aseanflow brand button variants
 */
export const webgenixButtonVariants = {
  primary: "bg-aseanflow-#10B981 hover:bg-aseanflow-#10B981-deep text-white",
  secondary:
    "bg-webgenix-light-purple hover:bg-aseanflow-#10B981 text-webgenix-dark-gray hover:text-white",
  gradient:
    "bg-gradient-to-r from-webgenix-gradient-start to-webgenix-gradient-end hover:from-aseanflow-#10B981-deep hover:to-aseanflow-#10B981 text-white",
} as const;
