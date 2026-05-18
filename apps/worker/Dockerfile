FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/database/package.json packages/database/
COPY packages/shared/package.json packages/shared/
COPY packages/tsconfig/package.json packages/tsconfig/
COPY apps/worker/package.json apps/worker/

RUN pnpm install --frozen-lockfile

COPY packages/database/ packages/database/
COPY packages/shared/ packages/shared/
COPY packages/tsconfig/ packages/tsconfig/
COPY apps/worker/ apps/worker/

RUN pnpm --filter @aseanflow/database generate
RUN pnpm --filter @aseanflow/worker build

CMD ["node", "apps/worker/dist/main.js"]
