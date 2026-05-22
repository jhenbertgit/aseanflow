# @aseanflow/web — ASEANFlow Frontend

Next.js 16 frontend for ASEANFlow cross-border payments (PHP → IDR).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/send` | Quote calculator (PHP → IDR) |
| `/transfer/[trackingCode]` | Transfer timeline with 7-state animation |
| `/demo` | Architecture diagram |

## Development

```bash
# From monorepo root
pnpm dev --filter web

# From this directory
pnpm dev
```

App runs on `http://localhost:3000`.

## Environment

```env
API_BASE_URL=http://localhost:3001
```
