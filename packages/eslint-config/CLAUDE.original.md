# CLAUDE.md - ESLint Config Package

## FEATURE:

**@aseanflow/eslint-config** — Shared flat ESLint config (eslint@9+) for the ASEANFlow monorepo. Uses `typescript-eslint`, `eslint-config-prettier`, and framework-specific overrides for Next.js, NestJS, and React internals. Exported as composable configs via package `exports` map.

## EXAMPLES:

### Usage in consuming packages

```javascript
// packages/*/eslint.config.mjs
import { config } from '@aseanflow/eslint-config';
export default config;
```

### Available Configs (exports map)

```json
{
  ".": "./index.js",              // Default: base + typescript + prettier
  "./base.js": "./base.js",       // JS recommended + typescript + prettier
  "./library.js": "./library.js", // Library-specific rules
  "./next.js": "./next.js",       // Next.js + React rules
  "./nest.js": "./nest.js",       // NestJS rules
  "./react-internal.js": "./react-internal.js"  // Internal React package rules
}
```

### Default Config Rules

```javascript
// index.js
{
  "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/consistent-type-imports": "error",
  "prefer-const": "error",
  "no-var": "error",
}
```

## DOCUMENTATION:

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new) — New config format
- [typescript-eslint](https://typescript-eslint.io/) — TypeScript-specific rules
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) — Disable conflicting rules

## OTHER CONSIDERATIONS:

### Key Rules

- **`consistent-type-imports: error`** — always use `import type` for type-only imports
- **`no-unused-vars` with `^_` ignore** — underscore-prefixed args allowed
- **`no-explicit-any: warn`** — warn but don't block
- **Ignores**: `dist/`, `.turbo/`, `node_modules/` globally

### Key Dependencies

- `@eslint/js@^9.0.0` — ESLint recommended rules
- `typescript-eslint@^7.0.0` — TypeScript ESLint integration
- `eslint-config-prettier@^9.0.0` — Prettier compatibility
- `@next/eslint-plugin-next@^14.0.0` — Next.js rules
- `eslint-plugin-react@^7.33.0` + `eslint-plugin-react-hooks@^4.6.0` — React rules
- `eslint-plugin-import@^2.28.0` — Import ordering
- `eslint-plugin-jsx-a11y@^6.7.0` — Accessibility
- `eslint-plugin-turbo@^1.0.0` + `eslint-config-turbo@^1.10.0` — Turborepo rules
- `globals@^15.0.0` — Global definitions
