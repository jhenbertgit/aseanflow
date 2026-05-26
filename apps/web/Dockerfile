FROM node:22-alpine AS build
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/tsconfig/*.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/
RUN pnpm install --frozen-lockfile

COPY apps/web/app ./apps/web/app
COPY apps/web/components ./apps/web/components
COPY apps/web/lib ./apps/web/lib
COPY apps/web/public ./apps/web/public
COPY apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY apps/web/eslint.config.js ./apps/web/eslint.config.js
COPY apps/web/components.json ./apps/web/components.json
COPY apps/web/postcss.config.mjs ./apps/web/postcss.config.mjs
COPY apps/web/tailwind.config.ts ./apps/web/tailwind.config.ts
COPY packages/ui/src ./packages/ui/src
COPY packages/ui/tsconfig.json ./packages/ui/tsconfig.json
COPY packages/ui/postcss.config.mjs ./packages/ui/postcss.config.mjs
COPY packages/ui/tailwind.config.ts ./packages/ui/tailwind.config.ts
COPY packages/ui/eslint.config.js ./packages/ui/eslint.config.js
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY packages/shared/eslint.config.js ./packages/shared/eslint.config.js
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/src ./packages/database/src
COPY packages/database/prisma.config.ts ./packages/database/prisma.config.ts
COPY packages/database/tsconfig.json ./packages/database/tsconfig.json
COPY packages/database/eslint.config.js ./packages/database/eslint.config.js
COPY turbo.json ./

RUN pnpm --filter @aseanflow/web build

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/apps/web/public ./public
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
