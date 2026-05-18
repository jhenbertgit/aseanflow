# CLAUDE.md - UI Components Package

## FEATURE:

**@aseanflow/ui** — Shared React 19 component library built on shadcn/ui + Radix UI primitives + Tailwind CSS v4. Provides Button, Card, Badge, Input, Label, Checkbox, Switch, Toaster components with `cn()` utility, design tokens, and accessibility helpers. Used by `apps/web` (Next.js 16).

## EXAMPLES:

### Component Usage

```tsx
// Import from specific paths (tree-shaking friendly)
import { Button } from '@aseanflow/ui/components/button';
import { Card, CardHeader, CardContent } from '@aseanflow/ui/components/card';
import { Badge } from '@aseanflow/ui/components/badge';
import { cn } from '@aseanflow/ui/lib/utils';

// In Next.js root layout
import '@aseanflow/ui/globals.css';
```

### Component Variants (cva pattern)

```tsx
// button.tsx uses class-variance-authority
<Button variant="default" size="lg">Send Transfer</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

### cn() Utility

```tsx
// lib/utils.ts — clsx + tailwind-merge
import { cn } from '@aseanflow/ui/lib/utils';
<div className={cn('p-4', isActive && 'bg-blue-500')} />
```

## DOCUMENTATION:

- [shadcn/ui](https://ui.shadcn.com/) — Component patterns and customization
- [Radix UI Primitives](https://www.radix-ui.com/primitives) — Accessible component foundations
- [Tailwind CSS v4](https://tailwindcss.com/docs) — CSS-based config, no `tailwind.config.js`
- [Class Variance Authority](https://cva.style/docs) — Component variant management
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) — Icons

## OTHER CONSIDERATIONS:

### Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | TypeScript compilation |
| `pnpm dev` | TypeScript watch mode |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` / `pnpm test:watch` | Jest + React Testing Library |

### Package Exports

```json
{
  "./globals.css": "./src/styles/globals.css",       // Global CSS + Tailwind
  "./postcss.config": "./postcss.config.mjs",         // PostCSS config
  "./tailwind.config": "./tailwind.config.ts",        // Shared Tailwind config
  "./lib/*": "./src/lib/*.ts",                        // cn, accessibility, design-tokens
  "./components/*": "./src/components/*.tsx",          // Individual components
  "./hooks/*": "./src/hooks/*.ts",                     // Custom hooks
  ".": "./src/index.ts"                                // Barrel export
}
```

### Package Structure

```
packages/ui/
├── src/
│   ├── index.ts                  # Barrel exports
│   ├── styles/globals.css        # Tailwind v4 globals
│   ├── components/
│   │   ├── button.tsx            # cva variants: default, ghost, outline
│   │   ├── card.tsx              # Card, CardHeader, CardContent, CardFooter
│   │   ├── badge.tsx             # Badge variants
│   │   ├── input.tsx             # Input with label integration
│   │   ├── label.tsx             # Radix Label
│   │   ├── checkbox.tsx          # Radix Checkbox
│   │   ├── switch.tsx            # Radix Switch
│   │   ├── toaster.tsx           # Sonner toast wrapper
│   │   └── index.ts
│   ├── lib/
│   │   ├── utils.ts              # cn(), design utilities (legacy: webgenix* names → rename to aseanflow*)
│   │   ├── accessibility.ts      # WCAG contrast checks, accessibility reports
│   │   └── design-tokens.ts      # Design token constants
│   └── hooks/                    # Custom React hooks (empty)
├── postcss.config.mjs
├── tailwind.config.ts
└── package.json
```

### Critical Rules

- **Tailwind v4** — CSS-based config, NOT `tailwind.config.js`
- **shadcn/ui pattern** — add new components via `pnpm dlx shadcn@latest add <component>` from `apps/web` root
- **Specific imports** — use `@aseanflow/ui/components/button` not barrel `@aseanflow/ui`
- **React 19** — compatible only with React 19+
- **No server components** — all components are client components (Radix requires it)
- **cn()** — always use for conditional classes, never raw string concat

### Key Dependencies

- `react@^19.1.1`, `react-dom@^19.1.1` — React 19
- `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-checkbox`, `@radix-ui/react-label` — Radix primitives
- `class-variance-authority@^0.7.1` — component variants
- `clsx@^2.1.1` + `tailwind-merge@^3.3.1` — className utilities
- `tailwindcss@^4.1.11` + `@tailwindcss/postcss@^4.1.11` — Tailwind v4
- `lucide-react@^0.475.0` — icons
- `sonner@^2.0.7` — toast notifications
- `next-themes@^0.4.6` — dark/light mode
- `tw-animate-css@^1.3.6` — Tailwind animations
- `zod@^3.25.76` — form validation schemas
