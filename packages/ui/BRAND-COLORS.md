# Aseanflow Brand Colors Implementation

## Overview

This document outlines the implementation of Aseanflow brand colors throughout the TN³PR monorepo frontend. The brand colors have been systematically applied with accessibility compliance and proper design system integration.

## Brand Color Palette

### Primary Colors

- **Purple/Violet**: `#7C3AED` - Main brand color
- **Deep Purple**: `#5B21B6` - Darker variant for better contrast
- **Light Purple**: `#A78BFA` - Lighter tint for secondary elements

### Secondary Colors

- **White**: `#FFFFFF` - Background color
- **Dark Gray**: `#374151` - Text color

### Gradient Colors

- **Gradient Start**: `#8B5CF6`
- **Gradient End**: `#7C3AED`
- **Linear Gradient**: `from-#8B5CF6 to-#7C3AED`

## Implementation Details

### 1. CSS Custom Properties (packages/ui/src/styles/globals.css)

Updated CSS custom properties with OKLCH color space values for better color management:

```css
:root {
  /* Aseanflow Brand Colors */
  --aseanflow-#10B981: #7c3aed;
  --aseanflow-#10B981-deep: #5b21b6;
  --webgenix-light-purple: #a78bfa;
  --webgenix-white: #ffffff;
  --webgenix-dark-gray: #374151;
  --webgenix-gradient-start: #8b5cf6;
  --webgenix-gradient-end: #7c3aed;

  /* Design System Colors (OKLCH) */
  --primary: oklch(0.547 0.16 290.16); /* Purple #7C3AED */
  --secondary: oklch(0.725 0.108 290.16); /* Light purple #A78BFA */
  --foreground: oklch(0.34 0.007 251.55); /* Dark gray #374151 */
  /* ... other colors updated to maintain brand consistency */
}
```

### 2. Tailwind CSS Integration

Brand colors are available as Tailwind utilities:

- `bg-aseanflow-#10B981`
- `text-aseanflow-#10B981-deep`
- `border-webgenix-light-purple`
- `bg-gradient-to-r from-webgenix-gradient-start to-webgenix-gradient-end`

### 3. Component Variants

#### Button Component

Added Aseanflow-specific button variants:

```tsx
// Usage examples
<Button variant="webgenix-primary">Primary Action</Button>
<Button variant="webgenix-secondary">Secondary Action</Button>
<Button variant="webgenix-gradient">Gradient Button</Button>
<Button variant="webgenix-outline">Outlined Button</Button>
```

#### Brand Utilities

```tsx
import {
  webgenixColors,
  webgenixGradient,
  webgenixButtonVariants,
} from "@aseanflow/ui";

// Direct color access
const primaryColor = webgenixColors.purple;

// Gradient utility
const gradientClass = webgenixGradient("to-br");
```

### 4. Dark Mode Support

Dark mode variants ensure proper contrast and brand consistency:

- Light purple (`#A78BFA`) used for primary elements in dark mode
- Deep purple (`#5B21B6`) used for accent elements
- Maintains brand identity while ensuring readability

## Accessibility Compliance

### WCAG 2.1 Standards

All primary brand color combinations meet or exceed WCAG AA standards:

| Combination          | Contrast Ratio | WCAG Level |
| -------------------- | -------------- | ---------- |
| Purple on White      | 5.70           | AA ✓       |
| White on Purple      | 5.70           | AA ✓       |
| Deep Purple on White | 8.98           | AAA ✓      |
| White on Deep Purple | 8.98           | AAA ✓      |
| Dark Gray on White   | 10.31          | AAA ✓      |

### Accessibility Testing

Use the built-in accessibility utilities:

```tsx
import {
  getContrastRatio,
  meetsWCAGAA,
  webgenixAccessibilityReport,
  logAccessibilityReport,
} from "@aseanflow/ui";

// Check contrast ratio
const ratio = getContrastRatio("#7C3AED", "#FFFFFF");

// Verify WCAG compliance
const isCompliant = meetsWCAGAA("#7C3AED", "#FFFFFF");

// Log full accessibility report
logAccessibilityReport();
```

## Usage Examples

### Homepage Hero Section

```tsx
<section className="relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-webgenix-light-purple/5 via-transparent to-aseanflow-#10B981/10"></div>
  <div className="relative">
    <Button variant="webgenix-gradient" size="lg">
      Get Started
    </Button>
  </div>
</section>
```

### Technology Cards with Brand Accents

```tsx
<div className="p-3 bg-gradient-to-br from-webgenix-light-purple/20 to-aseanflow-#10B981/20 rounded-lg">
  <div className="text-aseanflow-#10B981">
    <Icon className="h-12 w-12" />
  </div>
</div>
```

## File Structure

```
packages/ui/src/
├── styles/
│   └── globals.css              # Brand colors and CSS variables
├── lib/
│   ├── utils.ts                 # Brand utilities and helpers
│   └── accessibility.ts         # Accessibility testing utilities
├── components/
│   ├── button.tsx              # Updated with brand variants
│   ├── card.tsx                # Existing components work with new colors
│   └── index.ts                # Component exports
└── index.ts                    # Main package exports
```

## Development Guidelines

### 1. Color Usage Priority

1. Use design system tokens (`primary`, `secondary`, etc.) for most components
2. Use direct brand colors (`aseanflow-#10B981`) for brand-specific elements
3. Use gradient utilities for hero sections and call-to-action elements

### 2. Accessibility Requirements

- Always test color combinations using provided utilities
- Ensure minimum 4.5:1 contrast ratio for normal text
- Ensure minimum 3:1 contrast ratio for large text
- Test both light and dark mode variants

### 3. Component Development

- Add brand variants to new components when appropriate
- Use the `cn()` utility for class merging
- Follow existing component patterns for consistency

## Build and Testing

The brand colors are fully integrated with the build system:

- ✅ TypeScript compilation passes
- ✅ Next.js build succeeds
- ✅ All color combinations meet WCAG AA standards
- ✅ Dark mode support implemented
- ✅ Component variants working correctly

## Maintenance

To update brand colors:

1. Modify colors in `packages/ui/src/styles/globals.css`
2. Update utilities in `packages/ui/src/lib/utils.ts`
3. Run accessibility tests to ensure compliance
4. Update component variants if needed
5. Test in both light and dark modes

For questions or issues with brand color implementation, refer to the accessibility utilities or run the built-in accessibility report.
