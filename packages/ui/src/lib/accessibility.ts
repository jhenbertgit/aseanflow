/**
 * Aseanflow Brand Color Accessibility Utilities
 * Ensures WCAG 2.1 AA compliance for brand colors
 */

import { webgenixColors } from "./utils";

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

/**
 * Aseanflow brand color accessibility report
 */
export const webgenixAccessibilityReport = {
  // Primary purple on white
  purpleOnWhite: {
    combination: `${webgenixColors.purple} on ${webgenixColors.white}`,
    ratio: getContrastRatio(webgenixColors.purple, webgenixColors.white),
    meetsAA: meetsWCAGAA(webgenixColors.purple, webgenixColors.white),
    meetsAAA: meetsWCAGAAA(webgenixColors.purple, webgenixColors.white),
  },
  // White text on purple
  whiteOnPurple: {
    combination: `${webgenixColors.white} on ${webgenixColors.purple}`,
    ratio: getContrastRatio(webgenixColors.white, webgenixColors.purple),
    meetsAA: meetsWCAGAA(webgenixColors.white, webgenixColors.purple),
    meetsAAA: meetsWCAGAAA(webgenixColors.white, webgenixColors.purple),
  },
  // Deep purple on white
  deepPurpleOnWhite: {
    combination: `${webgenixColors.deepPurple} on ${webgenixColors.white}`,
    ratio: getContrastRatio(webgenixColors.deepPurple, webgenixColors.white),
    meetsAA: meetsWCAGAA(webgenixColors.deepPurple, webgenixColors.white),
    meetsAAA: meetsWCAGAAA(webgenixColors.deepPurple, webgenixColors.white),
  },
  // White on deep purple
  whiteOnDeepPurple: {
    combination: `${webgenixColors.white} on ${webgenixColors.deepPurple}`,
    ratio: getContrastRatio(webgenixColors.white, webgenixColors.deepPurple),
    meetsAA: meetsWCAGAA(webgenixColors.white, webgenixColors.deepPurple),
    meetsAAA: meetsWCAGAAA(webgenixColors.white, webgenixColors.deepPurple),
  },
  // Dark gray on white
  darkGrayOnWhite: {
    combination: `${webgenixColors.darkGray} on ${webgenixColors.white}`,
    ratio: getContrastRatio(webgenixColors.darkGray, webgenixColors.white),
    meetsAA: meetsWCAGAA(webgenixColors.darkGray, webgenixColors.white),
    meetsAAA: meetsWCAGAAA(webgenixColors.darkGray, webgenixColors.white),
  },
  // Dark gray on light purple
  darkGrayOnLightPurple: {
    combination: `${webgenixColors.darkGray} on ${webgenixColors.lightPurple}`,
    ratio: getContrastRatio(
      webgenixColors.darkGray,
      webgenixColors.lightPurple,
    ),
    meetsAA: meetsWCAGAA(webgenixColors.darkGray, webgenixColors.lightPurple),
    meetsAAA: meetsWCAGAAA(webgenixColors.darkGray, webgenixColors.lightPurple),
  },
};

/**
 * Log accessibility report to console
 */
export function logAccessibilityReport(): void {
  console.group("🎨 Aseanflow Brand Colors - Accessibility Report");

  Object.values(webgenixAccessibilityReport).forEach((data) => {
    const status = data.meetsAAA
      ? "🟢 AAA"
      : data.meetsAA
        ? "🟡 AA"
        : "🔴 Failed";
    console.log(
      `${status} ${data.combination} - Ratio: ${data.ratio.toFixed(2)}`,
    );
  });

  console.groupEnd();
}
