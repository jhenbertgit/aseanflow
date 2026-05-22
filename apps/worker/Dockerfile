FROM node:20-alpine
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/
RUN pnpm install --frozen-lockfile

COPY apps/worker ./apps/worker
COPY packages ./packages
COPY turbo.json ./

RUN pnpm --filter @aseanflow/database generate
RUN pnpm --filter @aseanflow/worker build

ENV CI=true
RUN pnpm prune --prod

ENV NODE_ENV=production
CMD ["node", "apps/worker/dist/src/main.js"]
