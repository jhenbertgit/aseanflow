# CLAUDE.md - Prettier Config Package

## FEATURE:

**@aseanflow/prettier-config** — Shared Prettier config for ASEANFlow monorepo. Single `index.js` export, consumed via `"prettier": "@aseanflow/prettier-config"` in `package.json`.

## EXAMPLES:

### Usage

```json
// packages/*/package.json
{
  "prettier": "@aseanflow/prettier-config"
}
```

### Config Values

```javascript
module.exports = {
  semi: false,                    // No semicolons
  trailingComma: 'es5',          // Trailing commas where valid in ES5
  singleQuote: true,             // Single quotes
  tabWidth: 2,                   // 2-space indent
  useTabs: false,                // Spaces, not tabs
  printWidth: 80,                // 80 char line width
  endOfLine: 'lf',               // Unix line endings
  bracketSpacing: true,          // Spaces in object literals
  arrowParens: 'always',         // Always wrap arrow params
  jsxSingleQuote: true,          // Single quotes in JSX
};
```

## DOCUMENTATION:

- [Prettier Configuration](https://prettier.io/docs/en/configuration.html) — Config file options
- [Prettier Options](https://prettier.io/docs/en/options.html) — All available options

## OTHER CONSIDERATIONS:

### Key Decisions

- **`semi: false`** — no semicolons project-wide. Matches NestJS/Next.js conventions.
- **`singleQuote: true` + `jsxSingleQuote: true`** — single quotes everywhere
- **`endOfLine: 'lf'`** — Unix line endings, prevents Windows `\r\n` diffs
- **No plugins** — empty `plugins: []`. Add if needed (e.g., `prettier-plugin-tailwindcss`).

### No build/commands

No build step, scripts, or deps. Pure config consumed via `prettier` field in `package.json`.