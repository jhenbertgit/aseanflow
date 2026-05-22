# Landing Page Redesign — Premium Fintech Dark Mode

**Date:** 2026-05-22
**Status:** Approved
**Scope:** `apps/web/app/page.tsx`, `apps/web/components/landing/`, `packages/ui/src/styles/globals.css`

## Goal

Transform the minimal single-hero landing page into a full-scroll premium fintech experience fusing Web3 and finance aesthetics. Dark mode, emerald+gold accents, mesh gradient backgrounds, glassmorphism cards. Hackathon MVP — no new dependencies.

## Design Direction

**Vibe:** Premium fintech dark mode — sleek navy/charcoal base, emerald primary actions, gold for rewards/premium highlights.

**Approach:** CSS-only visual layer. All backgrounds via `radial-gradient` positioned divs. Animations via Framer Motion (already in project). Zero new packages.

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-deep` | `#0a0f1a` | Page background |
| `--bg-surface` | `#0f1629` | Card/elevated surfaces |
| `--bg-surface-alt` | `#1a2035` | Alternate surface |
| `--text-primary` | `#f1f5f9` | Headings, body |
| `--text-muted` | `#94a3b8` | Secondary text, labels |
| `--accent-emerald` | `#10b981` | Primary actions, links, highlights |
| `--accent-emerald-dark` | `#059669` | Gradient end, hover |
| `--accent-gold` | `#fbbf24` | Rewards, premium badges |
| `--accent-gold-light` | `#fcd34d` | Gold hover states |
| `--border-glass` | `rgba(255,255,255,0.10)` | Glassmorphism card borders |

## Sections

### 1. MeshBackground (fixed layer)

- `fixed inset-0 pointer-events-none z-0`
- 3-4 positioned `radial-gradient` divs:
  - Top-right: emerald, ~8% opacity, large ellipse
  - Bottom-left: gold, ~6% opacity, large ellipse
  - Center: emerald, ~5% opacity, medium circle
- Static (no animation) — pure atmospheric depth

### 2. HeroSection

- Full viewport height (`min-h-screen`), centered content
- Uppercase micro-label: "CROSS-BORDER PAYMENTS" (letter-spacing, muted text)
- Title: "ASEAN" + "Flow" (Flow in emerald), bold, large
- Subtitle: "SWIFT-Free PHP ↔ IDR Payments", muted
- Two CTAs:
  - "Send Money" — emerald gradient bg, white text, links to `/send`
  - "Architecture" — outline style (glass border), links to `/architecture`
- Tracking code input + "Rewards" button (gold-accented)
- "Earn AFT reward tokens on every transfer" — gold text
- Framer Motion: stagger fade-up on all elements (0ms → 600ms delays)

### 3. HowItWorksSection

- Section title: "How It Works" centered
- 3 steps horizontal (flex row, stacks on mobile):
  1. **Enter Amount** — "Choose your PHP amount and see live IDR conversion"
  2. **Lock Rate** — "Real-time FX rate locked for 30 seconds"
  3. **Settle via BiFast** — "Instant settlement through Indonesia's BiFast network"
- Each step: numbered circle (emerald border, dark bg), title, description
- Connecting dots/line between steps (CSS pseudo-elements or simple border)
- Step 3 gets gold badge: "Anchored on Morph"
- Framer Motion: fade-up with stagger per card

### 4. FeaturesSection

- Section title: "Why ASEANFlow" centered
- 4-card grid: `grid grid-cols-1 md:grid-cols-2 gap-6`
- Glassmorphism cards: `bg-white/5 backdrop-blur-md border border-white/10 rounded-xl`
- Each card: emoji icon, title, 2-line description
- Cards:
  1. **SWIFT-Free** (⚡) — "No intermediary banks. Direct PHP to IDR corridor via Morph protocol."
  2. **Real-Time FX** (📊) — "Live exchange rates from Redis cache. Locked for 30 seconds per quote."
  3. **Morph Anchor** (🔒) — "Every settlement anchored on Morph L2. Cryptographic proof of finality."
  4. **AFT Rewards** (⭐) — "Earn reward tokens on every transfer. Fee discounts and wallet tracking." — gold left-border accent
- Framer Motion: stagger fade-up per card

### 5. StatsSection

- Horizontal strip, `bg-surface` bg, subtle top/bottom border
- 3 stats in a row (stacks on mobile):
  - "₱12.4M+" — "Total Transferred" (emerald number, muted label)
  - "< 30s" — "Avg Settlement" (emerald number, muted label)
  - "847" — "Chain Anchors" (emerald number, muted label)
- Numbers in large bold, labels in small muted
- Data is hardcoded (hackathon demo data)

### 6. CtaSection

- Centered content
- "Start Sending Money Today" heading
- Large "Send Money" button (emerald gradient)
- Gold text below: "Earn AFT on every transfer ⭐"
- Framer Motion: fade-up

## Component Architecture

```
apps/web/
  app/page.tsx              — imports and renders all sections
  components/landing/
    mesh-background.tsx      — fixed gradient orbs
    hero-section.tsx         — hero content
    how-it-works-section.tsx — 3-step flow
    features-section.tsx     — 4 glassmorphism cards
    stats-section.tsx        — counter strip
    cta-section.tsx          — final CTA
```

Each section is a separate component file. `page.tsx` composes them in order. All sections use `"use client"` for Framer Motion.

## CSS Changes

Add to `packages/ui/src/styles/globals.css`:
- New CSS custom properties for dark theme colors (listed in Color System above)
- Glassmorphism utility class: `.glass-card` with `bg-white/5 backdrop-blur-md border border-white/10`
- Mesh gradient orb positions (or inline styles on component)

No changes to `tailwind.config.js` (project uses Tailwind v4 CSS-based config).

## Mobile Responsive

- All sections stack vertically on mobile
- Hero: reduced padding, smaller text sizes via `sm:` / `md:` breakpoints
- How It Works: vertical stack on mobile, horizontal on `md:` up
- Features: single column on mobile, 2x2 grid on `md:` up
- Stats: single column on mobile, horizontal on `md:` up
- CTA: same layout, adjusted spacing

## No New Dependencies

Everything built with existing stack:
- Framer Motion (already installed)
- Tailwind v4 CSS (already configured)
- `@aseanflow/ui` Button + Input components (already used)

## Out of Scope

- Canvas/particle effects
- Animated counters (numbers hardcoded)
- Real stat data (demo values only)
- Light mode redesign (dark mode only for now)
- Navigation bar changes
