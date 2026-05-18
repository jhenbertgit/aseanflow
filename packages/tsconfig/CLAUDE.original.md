# CLAUDE.md - TypeScript Config Package

## FEATURE:

**@aseanflow/tsconfig** — Shared TypeScript config presets for the ASEANFlow monorepo. Provides base, Next.js, NestJS, and React library configurations. Consumed via `extends` in each package's `tsconfig.json`.

## EXAMPLES:

### Usage

```json
// apps/web/tsconfig.json
{ "extends": "@aseanflow/tsconfig/nextjs.json" }

// apps/api/tsconfig.json
{ "extends": "@aseanflow/tsconfig/nestjs.json" }

// packages/ui/tsconfig.json
{ "extends": "@aseanflow/tsconfig/react-library.json" }

// packages/shared/tsconfig.json
{ "extends": "@aseanflow/tsconfig/base.json" }
```

### Base Config Key Settings

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "skipLibCheck": true,
    "noEmit": true,
    "incremental": true
  }
}
```

## DOCUMENTATION:

- [TypeScript tsconfig Reference](https://www.typescriptlang.org/tsconfig) — All compiler options
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html) — bundler vs node

## OTHER CONSIDERATIONS:

### Available Configs

| File | Target | Use For |
|------|--------|---------|
| `base.json` | ES2022, ESM, strict | Shared packages (shared, redis, database) |
| `nextjs.json` | Extends base + Next.js | `apps/web` |
| `nestjs.json` | Extends base + NestJS | `apps/api`, `apps/worker` |
| `react-library.json` | Extends base + React JSX | `packages/ui` |

### Key Decisions

- **`moduleResolution: "bundler"`** — required for ESM + pnpm workspaces
- **`noEmit: true`** — packages use tsc for type-checking only; turbo handles builds
- **`isolatedModules: true`** — each file is independent module, required by bundlers
- **`strict: true` + `strictNullChecks: true`** — no implicit any, no unchecked nulls

### Prisma v7 Note

`packages/database` uses this base config. Prisma v7 generated client output (`generated/prisma/`) must be in `.gitignore` but accessible to TypeScript. No special tsconfig changes needed — `moduleResolution: "bundler"` resolves the generated output correctly.
