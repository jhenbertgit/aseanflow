/**
 * ASEANFlow Brand Color Accessibility Utilities
 * Ensures WCAG 2.1 AA compliance for brand colors
 */

import { aseanflowColors } from "./utils";

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance according to WCAG guidelines
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  isLargeText = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7.0;
}

const white = "#FFFFFF";

/**
 * ASEANFlow brand color accessibility report
 */
export const aseanflowAccessibilityReport = {
  primaryOnWhite: {
    combination: `${aseanflowColors.primary} on ${white}`,
    ratio: getContrastRatio(aseanflowColors.primary, white),
    meetsAA: meetsWCAGAA(aseanflowColors.primary, white),
    meetsAAA: meetsWCAGAAA(aseanflowColors.primary, white),
  },
  whiteOnPrimary: {
    combination: `${white} on ${aseanflowColors.primary}`,
    ratio: getContrastRatio(white, aseanflowColors.primary),
    meetsAA: meetsWCAGAA(white, aseanflowColors.primary),
    meetsAAA: meetsWCAGAAA(white, aseanflowColors.primary),
  },
  darkOnWhite: {
    combination: `${aseanflowColors.dark} on ${white}`,
    ratio: getContrastRatio(aseanflowColors.dark, white),
    meetsAA: meetsWCAGAA(aseanflowColors.dark, white),
    meetsAAA: meetsWCAGAAA(aseanflowColors.dark, white),
  },
  whiteOnDark: {
    combination: `${white} on ${aseanflowColors.dark}`,
    ratio: getContrastRatio(white, aseanflowColors.dark),
    meetsAA: meetsWCAGAA(white, aseanflowColors.dark),
    meetsAAA: meetsWCAGAAA(white, aseanflowColors.dark),
  },
  accentOnWhite: {
    combination: `${aseanflowColors.accent} on ${white}`,
    ratio: getContrastRatio(aseanflowColors.accent, white),
    meetsAA: meetsWCAGAA(aseanflowColors.accent, white),
    meetsAAA: meetsWCAGAAA(aseanflowColors.accent, white),
  },
  successOnWhite: {
    combination: `${aseanflowColors.success} on ${white}`,
    ratio: getContrastRatio(aseanflowColors.success, white),
    meetsAA: meetsWCAGAA(aseanflowColors.success, white),
    meetsAAA: meetsWCAGAAA(aseanflowColors.success, white),
  },
};

/**
 * Log accessibility report to console
 */
export function logAccessibilityReport(): void {
  console.group("ASEANFlow Brand Colors - Accessibility Report");

  Object.values(aseanflowAccessibilityReport).forEach((data) => {
    const status = data.meetsAAA
      ? "AAA"
      : data.meetsAA
        ? "AA"
        : "Failed";
    console.log(
      `${status} ${data.combination} - Ratio: ${data.ratio.toFixed(2)}`,
    );
  });

  console.groupEnd();
}
