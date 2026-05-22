FROM node:20-alpine
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/redis/package.json ./packages/redis/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/
RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages ./packages
COPY turbo.json ./

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN cd packages/database && pnpm generate
RUN cd packages/shared && pnpm build
RUN cd packages/redis && pnpm build
RUN cd packages/database && pnpm build
RUN cd apps/api && pnpm build

ENV CI=true
RUN pnpm prune --prod

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/api/dist/src/main.js"]
