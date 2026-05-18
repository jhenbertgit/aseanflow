# Aseanflow Starter Template - Setup Guide

This guide explains how to transform the Aseanflow starter template into your custom-branded project.

## Table of Contents

- [Template Initialization](#template-initialization)
- [Manual Customization](#manual-customization)
- [Optional Features](#optional-features)
- [Environment Configuration](#environment-configuration)
- [Customizing the Stack](#customizing-the-stack)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Template Initialization

The fastest way to set up your project is using the automated initialization script.

### Automated Setup

```bash
# 1. Clone or download the template
git clone https://github.com/webgenix-co/aseanflow.git my-project
cd my-project

# 2. Run initialization script
node scripts/init-template.mjs
```

The script will guide you through:

1. **Project Configuration**
   - Project name (e.g., "My Awesome App")
   - Package namespace (e.g., @mycompany)
   - Project description

2. **Feature Selection**
   - Authentication system (JWT + NextAuth.js)
   - Redis caching
   - Example code and seed data
   - Testing setup (Jest + Playwright)

3. **Branding Configuration**
   - Stack name (default: "TN³PR")
   - Primary brand color name

4. **Automatic Actions**
   - Replaces all @aseanflow references with your namespace
   - Updates project names and slugs
   - Generates secure JWT and NextAuth secrets
   - Updates Docker container names
   - Updates database names
   - Configures environment files
   - Removes optional features if not selected

### What Gets Changed

The initialization script automatically updates:

#### Package Names
```
@aseanflow/ui → @{your-namespace}/ui
@aseanflow/shared → @{your-namespace}/shared
@aseanflow/auth → @{your-namespace}/auth
@aseanflow/redis → @{your-namespace}/redis
@aseanflow/database → @{your-namespace}/database
```

#### Database & Docker
```
aseanflow_dev → {your-project-slug}_dev
aseanflow-postgres-dev → {your-project-slug}-postgres-dev
aseanflow-redis-dev → {your-project-slug}-redis-dev
```

#### Branding
```
aseanflow → {Your Project Name}
aseanflow API → {Your Project Name} API
aseanflow-#10B981 → {your-project-slug}-{primary-color}
```

## Manual Customization

If you prefer manual setup or need to customize beyond the automated script:

### 1. Update Package Names

Edit all `package.json` files to replace the namespace:

```json
// Before
{
  "name": "@aseanflow/ui"
}

// After
{
  "name": "@mycompany/ui"
}
```

Files to update:
- Root `package.json`
- `apps/web/package.json`
- `apps/api/package.json`
- All files in `packages/*/package.json`

### 2. Update Import Statements

Search and replace all imports across the codebase:

```bash
# Find all @aseanflow imports
grep -r "@aseanflow" --include="*.ts" --include="*.tsx" --include="*.json"
```

Replace with your namespace in:
- TypeScript files (`.ts`, `.tsx`)
- JSON configuration files
- README and documentation files

### 3. Update TypeScript Path Aliases

Edit `tsconfig.json` in the root:

```json
{
  "compilerOptions": {
    "paths": {
      "@mycompany/ui": ["./packages/ui/src"],
      "@mycompany/shared": ["./packages/shared/src"],
      "@mycompany/auth": ["./packages/auth/src"],
      "@mycompany/redis": ["./packages/redis/src"],
      "@mycompany/database": ["./packages/database/src"]
    }
  }
}
```

### 4. Update Docker Configuration

Edit `docker-compose.dev.yml`:

```yaml
services:
  postgres:
    container_name: myproject-postgres-dev
    environment:
      POSTGRES_DB: myproject_dev
    networks:
      - myproject_dev_network

  redis:
    container_name: myproject-redis-dev
    networks:
      - myproject_dev_network

networks:
  myproject_dev_network:
    driver: bridge
```

### 5. Update Environment Variables

Update database URLs in all `.env.example` files:

```env
# Before
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aseanflow_dev

# After
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myproject_dev
```

### 6. Update Branding & UI

**Color Tokens** (`packages/ui/tailwind.config.ts`):

```typescript
// Before
colors: {
  'aseanflow-#10B981': '#8B5CF6',
  'aseanflow-#10B981-deep': '#6D28D9',
}

// After
colors: {
  'mycompany-primary': '#your-hex-color',
  'mycompany-primary-deep': '#your-darker-hex',
}
```

**Update color references** in:
- `packages/ui/src/lib/design-tokens.ts`
- `apps/web/app/page.tsx`
- Any component files using brand colors

### 7. Update API Documentation

Edit `apps/api/src/main.ts`:

```typescript
// Before
const config = new DocumentBuilder()
  .setTitle('aseanflow API')
  .setDescription('TN³PR Stack API with JWT Authentication')

// After
const config = new DocumentBuilder()
  .setTitle('My Project API')
  .setDescription('My Project API with JWT Authentication')
```

### 8. Generate Secrets

Generate secure secrets for production:

```bash
# JWT Access Secret (64 characters)
openssl rand -base64 64

# JWT Refresh Secret (64 characters)
openssl rand -base64 64

# NextAuth Secret (minimum 32 characters)
openssl rand -base64 32
```

Add these to your `.env` files.

## Optional Features

The template includes several optional features that can be removed if not needed:

### Removing Authentication

If you don't need authentication:

1. **Remove packages:**
   ```bash
   rm -rf packages/auth
   ```

2. **Remove backend auth module:**
   ```bash
   rm -rf apps/api/src/auth
   ```

3. **Remove frontend auth pages:**
   ```bash
   rm -rf apps/web/app/\(auth\)
   rm apps/web/lib/auth.config.ts
   rm apps/web/lib/hooks/use-next-auth.ts
   ```

4. **Update dependencies:**
   - Remove `@your-namespace/auth` from `apps/web/package.json` and `apps/api/package.json`
   - Remove `next-auth`, `@nestjs/passport`, `passport-jwt` dependencies

5. **Remove from environment:**
   - Remove JWT_* and NEXTAUTH_* variables from `.env` files

### Removing Redis

If you don't need caching:

1. **Remove package:**
   ```bash
   rm -rf packages/redis
   ```

2. **Update dependencies:**
   - Remove `@your-namespace/redis` from `apps/api/package.json`

3. **Remove from Docker:**
   - Remove Redis service from `docker-compose.dev.yml`
   - Remove REDIS_* environment variables

4. **Update backend:**
   - Remove Redis imports from `apps/api/src/common/`
   - Remove caching logic from services

### Removing Examples

To start with a clean slate:

1. **Remove example modules:**
   ```bash
   rm -rf apps/api/src/posts
   rm -rf apps/api/src/users
   rm -rf apps/web/app/\(protected\)/dashboard/posts
   ```

2. **Remove seed data:**
   ```bash
   rm packages/database/prisma/seed.ts
   ```

3. **Clean up Prisma schema:**
   - Remove Post, Tag, PostTag models from `packages/database/prisma/schema.prisma`
   - Keep User model if using authentication

### Removing Testing

If you don't need the testing infrastructure:

1. **Remove test directories:**
   ```bash
   rm -rf apps/api/test
   rm -rf apps/web/tests
   rm apps/web/jest.config.js
   rm apps/web/playwright.config.ts
   ```

2. **Remove test dependencies:**
   - Remove Jest, Playwright, Testing Library from package.json files
   - Remove test scripts from package.json

## Environment Configuration

### Development Environment

Create `.env` files from examples:

```bash
# Root environment
cp .env.example .env

# Backend environment
cp apps/api/.env.example apps/api/.env

# Frontend environment
cp apps/web/.env.example apps/web/.env.local
```

### Production Environment

For production deployments:

1. **Never commit `.env` files** - Use your platform's environment variable management
2. **Use strong secrets** - Generate new secrets for production (64+ characters)
3. **Update URLs** - Change localhost URLs to your domain
4. **Database configuration** - Use managed PostgreSQL service
5. **Redis configuration** - Use managed Redis service (Redis Cloud, AWS ElastiCache, etc.)

### Environment Variable Checklist

**Required for all setups:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "production" in production
- `PORT` - Backend API port (default: 3001)
- `FRONTEND_URL` - Frontend application URL

**Required if using authentication:**
- `JWT_ACCESS_SECRET` - Secret for access tokens (64+ chars)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (64+ chars)
- `JWT_ACCESS_EXPIRY` - Access token lifetime (e.g., "15m")
- `JWT_REFRESH_EXPIRY` - Refresh token lifetime (e.g., "7d")
- `NEXTAUTH_SECRET` - NextAuth.js secret (32+ chars)
- `NEXTAUTH_URL` - Frontend URL for NextAuth.js

**Required if using Redis:**
- `REDIS_URL` - Redis connection string
- `REDIS_HOST` - Redis host (for docker-compose)
- `REDIS_PORT` - Redis port (default: 6379)

## Customizing the Stack

### Adding New Packages

Create a new shared package:

```bash
mkdir -p packages/my-package/src
cd packages/my-package
```

Create `package.json`:

```json
{
  "name": "@mycompany/my-package",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@mycompany/tsconfig": "workspace:*",
    "@mycompany/eslint-config": "workspace:*",
    "typescript": "^5.9.0"
  }
}
```

Create `tsconfig.json`:

```json
{
  "extends": "@mycompany/tsconfig/base.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Update root `tsconfig.json` paths and install:

```bash
pnpm install
```

### Adding shadcn/ui Components

From the `apps/web` directory:

```bash
cd apps/web
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add form
```

Components are automatically added to `packages/ui/src/components/`.

### Customizing the Database Schema

Edit `packages/database/prisma/schema.prisma`:

```prisma
model MyModel {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // Add your fields...

  @@map("my_models")
}
```

After schema changes:

```bash
pnpm db:generate  # Regenerate Prisma client
pnpm db:sync      # Push to database
```

## Deployment

### Vercel Deployment (Frontend)

1. Connect your Git repository to Vercel
2. Configure build settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && pnpm build --filter=web`
   - **Install Command:** `pnpm install`

3. Add environment variables:
   - All `NEXTAUTH_*` variables
   - `BACKEND_API_URL` (your backend URL)
   - `NEXT_PUBLIC_*` variables

### Railway/Render Deployment (Backend)

1. Configure build settings:
   - **Root Directory:** `apps/api`
   - **Build Command:** `cd ../.. && pnpm install && pnpm build --filter=api`
   - **Start Command:** `cd apps/api && pnpm start:prod`

2. Add services:
   - PostgreSQL database
   - Redis instance

3. Add environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `REDIS_URL` (from Redis service)
   - All `JWT_*` variables
   - `NODE_ENV=production`
   - `PORT` and `FRONTEND_URL`

### Docker Deployment

Build and deploy with Docker Compose:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

For production, update `docker-compose.yml` with:
- Production environment variables
- Proper volume mounts
- Health checks
- Resource limits

## Troubleshooting

### Common Issues

**Issue: Module not found `@aseanflow/*`**
- Solution: Run `pnpm install` after changing package names
- Verify `tsconfig.json` path aliases are updated

**Issue: Prisma client not generated**
- Solution: Run `pnpm db:generate`
- Check `packages/database/generated/prisma` exists

**Issue: Docker containers not starting**
- Solution: Check Docker daemon is running
- Verify ports 5432 and 6379 are available
- Run `docker-compose down` and `docker-compose up -d`

**Issue: Database connection failed**
- Solution: Verify `DATABASE_URL` in `.env` files
- Check PostgreSQL container is running: `docker ps`
- Ensure database exists: `docker exec -it {container} psql -U postgres`

**Issue: Redis connection failed**
- Solution: Verify Redis is running: `docker ps`
- Check `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT` in `.env`
- Test connection: `docker exec -it {container} redis-cli ping`

**Issue: TypeScript errors after renaming**
- Solution: Delete `.turbo` and `node_modules/.cache`
- Run `pnpm install` and `pnpm build`
- Restart your IDE/editor

### Getting Help

- **GitHub Issues:** [Report bugs or request features](https://github.com/webgenix-co/aseanflow/issues)
- **Documentation:** Check [CLAUDE.md](./CLAUDE.md) for development guidelines
- **Architecture:** Review [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Customization:** See [docs/CUSTOMIZATION.md](./docs/CUSTOMIZATION.md)

---

**Next Steps:** After setup, check out:
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture
- [docs/CUSTOMIZATION.md](./docs/CUSTOMIZATION.md) - Advanced customization
