# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the minimal hero-only landing page into a full-scroll premium fintech dark-mode experience with emerald+gold accents and mesh gradient backgrounds.

**Architecture:** 6 new section components in `apps/web/components/landing/`, each a `"use client"` component using Framer Motion for animations. Single `page.tsx` composes them. CSS variables added to `globals.css` for new dark theme colors. Zero new dependencies.

**Tech Stack:** Next.js 16, React 19, Framer Motion, Tailwind v4, `@aseanflow/ui` (Button, Input)

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/ui/src/styles/globals.css` | Add dark fintech CSS custom properties |
| Create | `apps/web/components/landing/mesh-background.tsx` | Fixed gradient orbs layer |
| Create | `apps/web/components/landing/hero-section.tsx` | Hero with CTAs and rewards input |
| Create | `apps/web/components/landing/how-it-works-section.tsx` | 3-step flow |
| Create | `apps/web/components/landing/features-section.tsx` | 4 glassmorphism cards |
| Create | `apps/web/components/landing/stats-section.tsx` | Counter strip |
| Create | `apps/web/components/landing/cta-section.tsx` | Final call to action |
| Rewrite | `apps/web/app/page.tsx` | Compose all sections |

---

### Task 1: Add Dark Fintech CSS Variables

**Files:**
- Modify: `packages/ui/src/styles/globals.css`

- [ ] **Step 1: Add CSS custom properties after the existing `--aseanflow-gradient-end` line in `:root`**

In `:root`, after line 17 (`--aseanflow-gradient-end: #10B981;`), add:

```css
  /* Dark Fintech Theme */
  --bg-deep: #0a0f1a;
  --bg-surface: #0f1629;
  --bg-surface-alt: #1a2035;
  --text-primary: #f1f5f9;
  --text-muted: #94a3b8;
  --accent-emerald: #10b981;
  --accent-emerald-dark: #059669;
  --accent-gold: #fbbf24;
  --accent-gold-light: #fcd34d;
  --border-glass: rgba(255, 255, 255, 0.10);
```

- [ ] **Step 2: Add glassmorphism utility in `@layer utilities`**

After the existing `.animate-fade-in-up` utility block (line ~169), add:

```css
  .glass-card {
    @apply rounded-xl;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.10);
  }
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/styles/globals.css
git commit -m "style: add dark fintech CSS variables and glassmorphism utility"
```

---

### Task 2: Create MeshBackground Component

**Files:**
- Create: `apps/web/components/landing/mesh-background.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

export function MeshBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.08), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-1/4 -left-1/4 h-[700px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(251,191,36,0.06), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/mesh-background.tsx
git commit -m "feat(landing): add mesh gradient background component"
```

---

### Task 3: Create HeroSection Component

**Files:**
- Create: `apps/web/components/landing/hero-section.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@aseanflow/ui/components/button";
import { Input } from "@aseanflow/ui/components/input";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HeroSection() {
  const [trackingCode, setTrackingCode] = useState("");
  const router = useRouter();

  function handleViewRewards(e: React.FormEvent) {
    e.preventDefault();
    const code = trackingCode.trim();
    if (code) router.push(`/rewards/${code}`);
  }

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.p
          variants={fadeUp}
          className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#94a3b8]"
        >
          Cross-Border Payments
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: "#f1f5f9" }}
        >
          ASEAN<span style={{ color: "#10b981" }}>Flow</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-md text-sm text-[#94a3b8] sm:text-base"
        >
          SWIFT-Free PHP ↔ IDR Payments
        </motion.p>

        <motion.div variants={fadeUp} className="flex gap-3">
          <Button asChild size="lg" className="bg-[#10b981] text-white hover:bg-[#059669]">
            <Link href="/send">Send Money</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-[rgba(255,255,255,0.1)] bg-transparent text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f1f5f9]"
          >
            <Link href="/architecture">Architecture</Link>
          </Button>
        </motion.div>

        <motion.form
          onSubmit={handleViewRewards}
          variants={fadeUp}
          className="flex w-full max-w-xs items-center gap-2"
        >
          <Input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="Tracking code"
            className="flex-1 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#f1f5f9] placeholder:text-[#64748b]"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-[#fbbf24] text-[#0a0f1a] hover:bg-[#fcd34d]"
          >
            Rewards
          </Button>
        </motion.form>

        <motion.p
          variants={fadeUp}
          className="text-xs text-[#fbbf24]"
        >
          Earn AFT reward tokens on every transfer ⭐
        </motion.p>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/hero-section.tsx
git commit -m "feat(landing): add hero section with emerald+gold accents"
```

---

### Task 4: Create HowItWorksSection Component

**Files:**
- Create: `apps/web/components/landing/how-it-works-section.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: 1,
    title: "Enter Amount",
    desc: "Choose your PHP amount and see live IDR conversion",
  },
  {
    num: 2,
    title: "Lock Rate",
    desc: "Real-time FX rate locked for 30 seconds",
  },
  {
    num: 3,
    title: "Settle via BiFast",
    desc: "Instant settlement through Indonesia’s BiFast network",
    badge: "Anchored on Morph",
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowItWorksSection() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center text-2xl font-bold tracking-tight text-[#f1f5f9] sm:text-3xl"
        >
          How It Works
        </motion.h2>

        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center md:flex-1"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#10b981] bg-[#0a0f1a] text-sm font-bold text-[#10b981]">
                {step.num}
              </div>
              <h3 className="mb-1 text-base font-semibold text-[#f1f5f9]">
                {step.title}
              </h3>
              <p className="text-sm text-[#94a3b8]">{step.desc}</p>
              {step.badge && (
                <span className="mt-2 rounded-full bg-[rgba(251,191,36,0.15)] px-3 py-0.5 text-xs font-medium text-[#fbbf24]">
                  {step.badge}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/how-it-works-section.tsx
git commit -m "feat(landing): add How It Works 3-step section"
```

---

### Task 5: Create FeaturesSection Component

**Files:**
- Create: `apps/web/components/landing/features-section.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "SWIFT-Free",
    desc: "No intermediary banks. Direct PHP to IDR corridor via Morph protocol.",
  },
  {
    icon: "📊",
    title: "Real-Time FX",
    desc: "Live exchange rates from Redis cache. Locked for 30 seconds per quote.",
  },
  {
    icon: "🔒",
    title: "Morph Anchor",
    desc: "Every settlement anchored on Morph L2. Cryptographic proof of finality.",
  },
  {
    icon: "⭐",
    title: "AFT Rewards",
    desc: "Earn reward tokens on every transfer. Fee discounts and wallet tracking.",
    gold: true,
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center text-2xl font-bold tracking-tight text-[#f1f5f9] sm:text-3xl"
        >
          Why ASEANFlow
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
              style={
                f.gold
                  ? { borderLeftColor: "#fbbf24", borderLeftWidth: "3px" }
                  : undefined
              }
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-1 text-base font-semibold text-[#f1f5f9]">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#94a3b8]">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/features-section.tsx
git commit -m "feat(landing): add features section with glassmorphism cards"
```

---

### Task 6: Create StatsSection Component

**Files:**
- Create: `apps/web/components/landing/stats-section.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "₱12.4M+", label: "Total Transferred" },
  { value: "< 30s", label: "Avg Settlement" },
  { value: "847", label: "Chain Anchors" },
] as const;

export function StatsSection() {
  return (
    <section className="relative border-y border-[rgba(255,255,255,0.06)] bg-[rgba(15,22,41,0.5)] px-4 py-14">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-[#10b981] sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-[#94a3b8]">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/stats-section.tsx
git commit -m "feat(landing): add stats section with demo counters"
```

---

### Task 7: Create CtaSection Component

**Files:**
- Create: `apps/web/components/landing/cta-section.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@aseanflow/ui/components/button";

export function CtaSection() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-md flex-col items-center gap-6 text-center"
      >
        <h2 className="text-2xl font-bold tracking-tight text-[#f1f5f9] sm:text-3xl">
          Start Sending Money Today
        </h2>
        <Button
          asChild
          size="lg"
          className="bg-[#10b981] px-8 text-white hover:bg-[#059669]"
        >
          <Link href="/send">Send Money</Link>
        </Button>
        <p className="text-sm text-[#fbbf24]">
          Earn AFT on every transfer ⭐
        </p>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/landing/cta-section.tsx
git commit -m "feat(landing): add final CTA section"
```

---

### Task 8: Rewrite page.tsx to Compose All Sections

**Files:**
- Rewrite: `apps/web/app/page.tsx`

- [ ] **Step 1: Replace the entire file with section composition**

```tsx
"use client";

import { MeshBackground } from "@/components/landing/mesh-background";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsSection } from "@/components/landing/stats-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#0a0f1a] text-[#f1f5f9]">
      <MeshBackground />
      <div className="relative z-10">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <CtaSection />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build --filter web`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(landing): compose full landing page with all sections"
```

---

### Task 9: Visual Verification

- [ ] **Step 1: Start dev server**

Run: `pnpm dev --filter web`

- [ ] **Step 2: Open http://localhost:3000 and verify**

Check:
1. Dark navy background visible (`#0a0f1a`)
2. Mesh gradient orbs visible (emerald top-right, gold bottom-left)
3. Hero: "ASEANFlow" title with emerald "Flow", two CTAs, rewards input
4. How It Works: 3 steps with numbered circles, gold badge on step 3
5. Features: 4 glassmorphism cards in 2x2 grid, gold left-border on AFT card
6. Stats: 3 counters in a row (₱12.4M+, < 30s, 847)
7. CTA: "Start Sending Money Today" with emerald button
8. Scroll animations fire on each section
9. Mobile: sections stack, hero text smaller
10. Navigation still works (sticky, theme toggle)
11. All links work (/send, /architecture, rewards)

- [ ] **Step 3: Fix any visual issues found**

Adjust spacing, colors, or layout as needed.

- [ ] **Step 4: Final commit if fixes needed**

```bash
git add -A
git commit -m "fix(landing): polish spacing and visual details"
```
