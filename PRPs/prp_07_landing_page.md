name: "PRP 07 — Landing Page: ASEANFlow Homepage"
description: |

  ## Purpose

  Build ASEANFlow landing page. Hero + tagline, CTA buttons, tech badges. Framer Motion entrance animations. Route: `/` (`apps/web/app/page.tsx`).

  ## Core Principles

  1. **Context is King**: Include ALL docs, examples, caveats
  2. **Validation Loops**: Provide executable tests/lints AI can run + fix
  3. **Information Dense**: Use codebase keywords + patterns
  4. **Progressive Success**: Start simple, validate, enhance
  5. **Global rules**: Follow all rules in CLAUDE.md

  ---

  ## Goal

  Landing page at `/`: hero ("ASEANFlow — SWIFT-Free ASEAN Payments"), subtitle ("Send PHP → IDR directly without SWIFT or USD"), "Send Money" → `/send`, "View Architecture" → `/demo`, badges (Morph, NestJS, Docker, Redis). Framer Motion entrance animations.

  ## Why

  - **First impression**: Judges see this first — convey value in 10s
  - **Clear CTA**: "Send Money" starts demo flow immediately
  - **Tech credibility**: Badges show stack without over-explaining

  ## What

  ### User-visible behavior
  - Page loads with entrance animation
  - Hero: "ASEANFlow — SWIFT-Free ASEAN Payments"
  - Subtitle: "Send PHP → IDR directly without SWIFT or USD"
  - "Send Money" button → `/send`
  - "View Architecture" button → `/demo`
  - Badges: Morph, NestJS, Docker, Redis

  ### Technical requirements
  - Next.js App Router page: `apps/web/app/page.tsx`
  - Tailwind CSS v4 styling
  - shadcn/ui components (Button, Badge)
  - Framer Motion entrance animations (AnimatePresence, motion.div)
  - Static content, no data fetching

  ### Success Criteria

  - [ ] Page loads at http://localhost:3000/
  - [ ] Hero text displays correctly
  - [ ] "Send Money" navigates to `/send`
  - [ ] "View Architecture" navigates to `/demo`
  - [ ] Tech badges visible
  - [ ] Entrance animations play on load
  - [ ] Responsive layout
  - [ ] No console errors

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://nextjs.org/docs/app/building-your-application/routing/pages
    why: App Router page conventions

  - url: https://ui.shadcn.com/
    why: Button, Badge component usage

  - doc: Tailwind CSS v4
    section: Styling and configuration
    critical: Tailwind v4 uses CSS-based config, not tailwind.config.js

  - doc: Framer Motion
    section: Animation patterns for entrance effects
    critical: Use motion.div for animated elements, AnimatePresence for mount/unmount
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  apps/web/app/page.tsx               # MODIFY or REPLACE — landing page
  apps/web/components/                 # Existing component directory
  packages/ui/src/styles/globals.css   # Tailwind v4 CSS config
  ```

  ### Desired Codebase tree

  ```txt
  apps/web/app/page.tsx                # Landing page with hero, CTAs, badges
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Tailwind v4 uses CSS-based config, not tailwind.config.js
  // CRITICAL: shadcn/ui components added via `pnpm dlx shadcn@latest add <component>` from web root
  // CRITICAL: Framer Motion — use 'use client' directive for animated components
  // CRITICAL: Next.js App Router — page.tsx is server component by default, animations need client
  ```

  ## Implementation Blueprint

  ### List of tasks

  ```yaml
  Task 7.1 — Install Dependencies:
    RUN in apps/web:
      - pnpm dlx shadcn@latest add button badge
      - pnpm add framer-motion (if not already installed)

  Task 7.2 — Landing Page:
    MODIFY apps/web/app/page.tsx:
      - CREATE hero section with title and subtitle
      - ADD "Send Money" CTA button → Link to /send
      - ADD "View Architecture" button → Link to /demo
      - ADD tech badges: Morph, NestJS, Docker, Redis
      - ADD Framer Motion entrance animations
      - USE 'use client' if needed for animations
      - USE shadcn/ui Button and Badge components
      - ENSURE responsive layout (mobile + desktop)

  Task 7.3 — Verify:
    RUN: pnpm dev
    OPEN: http://localhost:3000
    CHECK: All elements render, buttons navigate, animations play
  ```

  ### Per task pseudocode

  ```typescript
  // Task 7.2 — page.tsx
  'use client';

  import { motion } from 'framer-motion';
  import Link from 'next/link';
  import { Button } from '@aseanflow/ui/components/ui/button';
  import { Badge } from '@aseanflow/ui/components/ui/badge';

  export default function HomePage() {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">
            ASEANFlow — SWIFT-Free ASEAN Payments
          </h1>
          <p className="text-xl text-muted-foreground">
            Send PHP → IDR directly without SWIFT or USD
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <Button asChild size="lg">
            <Link href="/send">Send Money</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/demo">View Architecture</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-2"
        >
          <Badge>Morph</Badge>
          <Badge variant="secondary">NestJS</Badge>
          <Badge variant="secondary">Docker</Badge>
          <Badge variant="secondary">Redis</Badge>
        </motion.div>
      </main>
    );
  }
  ```

  ### Integration Points

  ```yaml
  ROUTES:
    - / → this page
    - /send → PRP 08 quote calculator
    - /demo → PRP 10 architecture diagram

  COMPONENTS:
    - uses: @aseanflow/ui Button, Badge
    - uses: framer-motion for animations
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint
  pnpm format
  cd apps/web && pnpm type-check
  # Expected: No errors
  ```

  ### Level 2: Visual Test

  ```bash
  pnpm dev
  # Open http://localhost:3000
  # Verify: Hero text, buttons, badges, animations
  # Click "Send Money" → navigates to /send
  # Click "View Architecture" → navigates to /demo
  ```

  ## Final Validation Checklist

  - [ ] No linting errors: `pnpm lint`
  - [ ] TypeScript clean: `cd apps/web && pnpm type-check`
  - [ ] Page loads without console errors
  - [ ] Animations play smoothly
  - [ ] Buttons navigate correctly
  - [ ] Responsive on mobile

  ---

  ## Anti-Patterns to Avoid

  - No over-animation — subtle entrance effects only
  - No auth/login prompts
  - No data fetching — static content
  - No heavy images — keep load fast
  - No `tailwind.config.js` — Tailwind v4 uses CSS config

  ## Dependencies

  - [PRP 01 — Project Setup](./prp_01_project_setup.md) (Project structure, packages)

  ## Next PRP

  [PRP 08 — Quote Calculator](./prp_08_quote_calculator.md)