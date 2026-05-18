# CLAUDE.md - @aseanflow/web

## FEATURE:

**ASEANFlow Frontend** — Next.js 16 frontend for SWIFT-free cross-border payments (PHP → IDR). 5 screens: landing `/`, quote calculator `/send`, transfer timeline `/transfer/[id]`, demo architecture `/demo`, plus health API proxy. No auth, no login. Tracking code is the only identifier. Framer Motion animations, React Query polling, Morph proof display.

## EXAMPLES:

PRP chunks that define this frontend:

- `PRPs/prp_07_landing_page.md` — `/` hero, CTAs (→/send, →/demo), tech badges, Framer Motion
- `PRPs/prp_08_quote_calculator.md` — `/send` PHP input, live IDR quote (React Query), "Continue Transfer" redirect
- `PRPs/prp_09_transfer_timeline.md` — `/transfer/[id]` animated 7-state timeline, 1s polling, Morph proof component
- `PRPs/prp_10_demo_docker_polish.md` — `/demo` architecture diagram, Docker Compose production

Key patterns:
- **API Client**: `lib/api/` — fetch wrapper hitting backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)
- **Components**: `components/` — app-specific only. Import shared UI from `@aseanflow/ui`
- **Types**: `@aseanflow/shared` for Zod schemas and shared types
- **State**: React Query for server state (quotes, transfer status). No Zustand.

## DOCUMENTATION:

- [Next.js 16 Docs](https://nextjs.org/docs) — App Router, Server Components, Turbopack
- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [Tailwind CSS v4](https://tailwindcss.com/docs) — CSS-based config, no tailwind.config.js
- [Framer Motion](https://www.framer.com/motion/) — Animation library for timeline
- [React Query](https://tanstack.com/query/) — Server state, polling
- Full PRP: `PRPs/aseanflow_main.md`

## OTHER CONSIDERATIONS:

### Critical Rules (violating any = bug)

- **No auth/login/register** — ASEANFlow has no authentication. Tracking code is the ONLY identifier
- **Tailwind v4** uses CSS-based config — NOT `tailwind.config.js`
- **shadcn/ui** added via `pnpm dlx shadcn@latest add <component>` from `apps/web` root
- **No float for money** — display amounts using backend Decimal values, format with `Intl.NumberFormat`
- **Transfer state machine** — linear, 7 states: `CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED`
- **1s polling** on `/transfer/[id]` — React Query `refetchInterval: 1000`, stop on `MORPH_ANCHORED`
- **Morph proof** — async, never block UI. Show proof hash only after `MORPH_ANCHORED` status
- **Package namespace** `@aseanflow` — all imports use this

### Anti-Patterns

- No Firebase, Supabase, MongoDB, Zustand, tRPC, GraphQL
- No overengineering — hackathon MVP
- No custom component library — use `@aseanflow/ui` (shadcn/ui)
- No Redux or global state stores — React Query for server state

### Dev Commands

```bash
pnpm dev                    # starts on :3000
pnpm dev --filter web       # frontend only
pnpm build --filter web     # production build
cd apps/web && pnpm typecheck  # type check
pnpm lint                   # lint all
```

### App Routes (5 screens)

| Route | Purpose |
|-------|---------|
| `/` | Landing — hero, CTAs → /send, /demo |
| `/send` | Quote calculator — PHP → IDR, React Query |
| `/transfer/[trackingCode]` | Animated timeline, 7 states, 1s polling |
| `/demo` | Architecture diagram for technical judges |
| `/api/health` | Proxied health check (postgres, redis) |

### Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
