/**
 * Design tokens for consistent spacing, typography, and layout patterns
 * across the TN3PR stack application
 */

export const spacing = {
  /** Section padding patterns for consistent vertical rhythm */
  section: {
    /** Small sections: py-8 md:py-12 */
    sm: "py-8 md:py-12" as const,
    /** Medium sections: py-12 md:py-16 lg:py-20 */
    md: "py-12 md:py-16 lg:py-20" as const,
    /** Large sections: py-12 md:py-24 lg:py-32 xl:py-48 */
    lg: "py-12 md:py-24 lg:py-32 xl:py-48" as const,
  },
  /** Container padding for consistent horizontal spacing */
  container: "px-4 md:px-6" as const,
  /** Card padding for consistent component spacing */
  card: {
    /** Standard card padding: p-6 */
    standard: "p-6" as const,
    /** Compact card padding: p-4 */
    compact: "p-4" as const,
    /** Large card padding: p-8 */
    large: "p-8" as const,
  },
  /** Grid gaps for consistent spacing between elements */
  grid: {
    /** Small gap: gap-4 */
    sm: "gap-4" as const,
    /** Medium gap: gap-6 */
    md: "gap-6" as const,
    /** Large gap: gap-8 */
    lg: "gap-8" as const,
    /** Extra large gap: gap-10 */
    xl: "gap-10" as const,
  },
  /** Component spacing for consistent internal spacing */
  component: {
    /** Small spacing: space-y-2 */
    sm: "space-y-2" as const,
    /** Medium spacing: space-y-4 */
    md: "space-y-4" as const,
    /** Large spacing: space-y-6 */
    lg: "space-y-6" as const,
    /** Extra large spacing: space-y-8 */
    xl: "space-y-8" as const,
  },
} as const;

export const typography = {
  /** Heading scale with responsive sizing */
  heading: {
    /** Hero heading: text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl/none */
    hero: "text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl/none" as const,
    /** Large heading: text-xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl */
    h1: "text-xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl" as const,
    /** Medium heading: text-lg font-semibold tracking-tight sm:text-xl md:text-2xl */
    h2: "text-lg font-semibold tracking-tight sm:text-xl md:text-2xl" as const,
    /** Small heading: text-base font-semibold tracking-tight sm:text-lg */
    h3: "text-base font-semibold tracking-tight sm:text-lg" as const,
  },
  /** Body text patterns */
  body: {
    /** Large body text: text-base md:text-lg */
    large: "text-base md:text-lg" as const,
    /** Standard body text: text-sm md:text-base */
    standard: "text-sm md:text-base" as const,
    /** Small body text: text-xs md:text-sm */
    small: "text-xs md:text-sm" as const,
  },
} as const;

export const layout = {
  /** Container patterns for consistent content width */
  container: {
    /** Standard container: mx-auto max-w-7xl px-4 md:px-6 */
    standard: "mx-auto max-w-7xl px-4 md:px-6" as const,
    /** Wide container: mx-auto max-w-7xl px-4 md:px-6 */
    wide: "mx-auto max-w-7xl px-4 md:px-6" as const,
    /** Narrow container: mx-auto max-w-4xl px-4 md:px-6 */
    narrow: "mx-auto max-w-4xl px-4 md:px-6" as const,
  },
  /** Grid patterns for responsive layouts */
  grid: {
    /** Technology cards: grid-cols-1 md:grid-cols-2 xl:grid-cols-3 */
    techCards: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" as const,
    /** Feature grid: grid-cols-1 md:grid-cols-2 */
    features: "grid-cols-1 md:grid-cols-2" as const,
    /** Three column: grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 */
    threeColumn: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" as const,
    /** Auto-fit responsive grid: grid-cols-[repeat(auto-fit,minmax(300px,1fr))] */
    autoFit: "grid-cols-[repeat(auto-fit,minmax(300px,1fr))]" as const,
    /** Two column responsive: grid-cols-1 sm:grid-cols-2 */
    twoColumn: "grid-cols-1 sm:grid-cols-2" as const,
  },
  /** Flex patterns for common layouts */
  flex: {
    /** Center items: flex flex-col items-center space-y-4 text-center */
    centerColumn: "flex flex-col items-center space-y-4 text-center" as const,
    /** Button row: flex flex-col sm:flex-row gap-4 items-center justify-center */
    buttonRow:
      "flex flex-col sm:flex-row gap-4 items-center justify-center" as const,
    /** Center content: flex items-center justify-center */
    center: "flex items-center justify-center" as const,
    /** Space between: flex items-center justify-between */
    spaceBetween: "flex items-center justify-between" as const,
  },
} as const;

export const gradients = {
  /** ASEANFlow brand gradient utilities */
  aseanflow: {
    /** Primary brand gradient */
    primary: "[background-image:var(--gradient-aseanflow)]" as const,
    /** Hover state gradient */
    hover: "[background-image:var(--gradient-aseanflow-hover)]" as const,
    /** Subtle background gradient */
    subtle: "[background-image:var(--gradient-aseanflow-subtle)]" as const,
    /** Accent component gradient */
    accent: "[background-image:var(--gradient-aseanflow-accent)]" as const,
  },
} as const;

export const accessibility = {
  /** WCAG 2.1 AA compliant color utilities */
  contrast: {
    /** High contrast text on light backgrounds */
    highOnLight: "text-[oklch(0.145_0.02_163)]" as const,
    /** High contrast text on dark backgrounds */
    highOnDark: "text-[oklch(0.985_0_0)]" as const,
    /** Medium contrast text for secondary content */
    mediumOnLight: "text-[oklch(0.45_0.03_163)]" as const,
    /** Medium contrast text for secondary content in dark mode */
    mediumOnDark: "text-[oklch(0.7_0.03_163)]" as const,
  },
  /** Focus and interaction states */
  focus: {
    /** High visibility focus ring */
    ring: "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" as const,
    /** Focus outline fallback for older browsers */
    outline:
      "focus-visible:outline-none focus:outline-2 focus:outline-primary focus:outline-offset-2" as const,
  },
} as const;

/** Design token type definitions for TypeScript intellisense */
export type SpacingSection = keyof typeof spacing.section;
export type SpacingCard = keyof typeof spacing.card;
export type SpacingGrid = keyof typeof spacing.grid;
export type SpacingComponent = keyof typeof spacing.component;
export type TypographyHeading = keyof typeof typography.heading;
export type TypographyBody = keyof typeof typography.body;
export type LayoutContainer = keyof typeof layout.container;
export type LayoutGrid = keyof typeof layout.grid;
export type LayoutFlex = keyof typeof layout.flex;
export type GradientAseanflow = keyof typeof gradients.aseanflow;
export type AccessibilityContrast = keyof typeof accessibility.contrast;
export type AccessibilityFocus = keyof typeof accessibility.focus;
