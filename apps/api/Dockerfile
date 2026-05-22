FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/redis/package.json ./packages/redis/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/tsconfig/*.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/
RUN pnpm install --frozen-lockfile

COPY apps/api/src ./apps/api/src
COPY apps/api/nest-cli.json ./apps/api/nest-cli.json
COPY apps/api/tsconfig.build.json ./apps/api/tsconfig.build.json
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/eslint.config.mjs ./apps/api/eslint.config.mjs
COPY apps/api/jest.config.js ./apps/api/jest.config.js
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/src ./packages/database/src
COPY packages/database/prisma.config.ts ./packages/database/prisma.config.ts
COPY packages/database/tsconfig.json ./packages/database/tsconfig.json
COPY packages/database/eslint.config.js ./packages/database/eslint.config.js
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY packages/shared/eslint.config.js ./packages/shared/eslint.config.js
COPY packages/redis/src ./packages/redis/src
COPY packages/redis/tsconfig.json ./packages/redis/tsconfig.json
COPY packages/redis/eslint.config.js ./packages/redis/eslint.config.js
COPY turbo.json ./

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm --filter @aseanflow/database generate
RUN pnpm --filter @aseanflow/shared build
RUN pnpm --filter @aseanflow/redis build
RUN pnpm --filter @aseanflow/database build
RUN pnpm --filter @aseanflow/api build

RUN pnpm deploy --prod --legacy --filter @aseanflow/api /app/deploy

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/deploy .

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
