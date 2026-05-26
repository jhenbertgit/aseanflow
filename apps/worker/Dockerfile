FROM node:22-alpine AS build
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/tsconfig/*.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/
RUN pnpm install --frozen-lockfile

COPY apps/worker/src ./apps/worker/src
COPY apps/worker/tsconfig.json ./apps/worker/tsconfig.json
COPY apps/worker/eslint.config.mjs ./apps/worker/eslint.config.mjs
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/src ./packages/database/src
COPY packages/database/prisma.config.ts ./packages/database/prisma.config.ts
COPY packages/database/tsconfig.json ./packages/database/tsconfig.json
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY turbo.json ./

RUN pnpm --filter @aseanflow/database generate
RUN pnpm --filter @aseanflow/shared build
RUN pnpm --filter @aseanflow/database build
RUN pnpm --filter @aseanflow/worker build

RUN pnpm deploy --prod --legacy --filter @aseanflow/worker /app/deploy
RUN cp -r /app/apps/worker/dist /app/deploy/dist

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/deploy .

ENV NODE_ENV=production
CMD ["node", "dist/apps/worker/src/main.js"]
