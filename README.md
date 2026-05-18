# Aseanflow Starter Template - TN³PR Stack

> **The Ultimate Production-Ready Fullstack Template** - Transform this into your custom project in minutes with complete authentication, CRUD operations, Redis caching, and modern UI components in a type-safe monorepo.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Nest.js](https://img.shields.io/badge/Nest.js-10-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748.svg)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **production-ready**, modern full-stack TypeScript monorepo **starter template** by **Aseanflow** featuring Next.js 16, Nest.js, Prisma ORM, Redis caching, and shadcn/ui components. This comprehensive development environment is designed for rapid development of scalable web applications with **complete fullstack features** and type safety throughout the stack.

## 🚀 Quick Template Initialization

Transform this template into your custom-branded project in just a few minutes:

```bash
# 1. Clone or download this template
git clone https://github.com/webgenix-co/aseanflow.git my-project
cd my-project

# 2. Run the initialization script
node scripts/init-template.mjs

# Follow the prompts to:
# - Set your project name and namespace
# - Choose optional features (Auth, Redis, Examples, Testing)
# - Configure branding and colors
# - Generate secure secrets

# 3. Install dependencies
pnpm install

# 4. Start development
docker-compose -f docker-compose.dev.yml up -d
pnpm db:sync
pnpm dev
```

**That's it!** Your custom-branded fullstack application is ready. 🎉

> **Not using the template?** Skip the initialization and follow the [Manual Setup](#-manual-setup) guide below.

## 🚀 Live Features

This template comes with **fully implemented** features out of the box:

✅ **Complete Authentication System**

- User registration and login with JWT
- Access/refresh token rotation
- Session management with Redis
- Password hashing with bcrypt
- Role-based access control (USER, ADMIN, MODERATOR)
- Protected routes on frontend and backend

✅ **Posts CRUD with Caching**

- Create, read, update, delete posts
- Automatic slug generation
- Tag system (many-to-many relationships)
- Draft and published states
- View counting
- Search and filtering
- Pagination with metadata
- Redis caching with smart invalidation

✅ **User Management**

- User profiles with avatars
- Profile editing
- User statistics (post count, views, account age)
- Admin user management

✅ **Modern Frontend**

- Type-safe API client with auto token refresh
- Authentication context and hooks
- Form validation with Zod
- Loading states and error handling
- Responsive mobile-first design
- Aseanflow branded UI

## 📦 What's Included

### Core Stack

- **TypeScript** - Strict type safety throughout the entire stack
- **Next.js 16** - React 19 framework with App Router, Server Components, and Turbopack
- **NextAuth.js v5** - Industry-standard authentication with session management
- **Nest.js** - Progressive Node.js framework with JWT authentication and comprehensive testing
- **Prisma ORM** - Type-safe database client with PostgreSQL
- **Redis** - In-memory caching for sessions and posts
- **shadcn/ui** - Beautiful, accessible UI components with Radix primitives

### Implemented Features

- **NextAuth.js Integration** - Credentials provider, JWT sessions, protected routes
- **API Proxy Pattern** - Next.js API routes proxy to backend (enhanced security)
- **Authentication Package** (`@aseanflow/auth`) - JWT generation, password hashing, token verification
- **Shared Types** (`@aseanflow/shared`) - Zod schemas, TypeScript types, validation rules, utilities
- **Redis Package** (`@aseanflow/redis`) - Session management, post caching, view counting
- **Backend Modules** - Auth, Posts, Users with full CRUD and caching
- **Frontend Components** - NextAuth integration, auth forms, data hooks
- **Testing Infrastructure** - Jest unit tests, E2E tests, visual regression

### Development Experience

- **pnpm Workspaces** - Efficient monorepo package management
- **Turbo** - Build system with intelligent caching and task orchestration
- **Changesets** - Automated versioning and release management
- **ESLint + Prettier** - Code quality and consistent formatting
- **Jest + Playwright** - Comprehensive testing (unit, E2E, visual, accessibility)
- **Docker** - Containerized development services (PostgreSQL, Redis)

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [pnpm](https://pnpm.io/installation) (v10.4.1 or higher)
- [Docker](https://docs.docker.com/get-docker/) (for PostgreSQL and Redis services)

## 📖 Manual Setup

If you prefer manual setup or have already run the initialization script:

```bash
# 1. Install dependencies
pnpm install

# 2. Start Docker services (PostgreSQL + Redis)
docker-compose -f docker-compose.dev.yml up -d

# 3. Configure environment variables
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit .env files with your secrets (see Environment Configuration section)

# 4. Setup database
pnpm db:generate  # Generate Prisma client
pnpm db:sync      # Push schema to database
pnpm db:seed      # Seed with example data (optional)

# 5. Start development servers
pnpm dev

# Access your apps:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001/api
# - API Docs: http://localhost:3001/api/docs
```

## 🔑 Environment Configuration

### Backend (`apps/api/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aseanflow_dev"
REDIS_URL="redis://localhost:6379"

JWT_ACCESS_SECRET="your-access-secret-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-change-in-production"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

NODE_ENV="development"
```

### Frontend (`apps/web/.env.local`)

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"

# Backend API URL (server-side only, not exposed to browser)
BACKEND_API_URL="http://localhost:3001/api"

# Public Variables
NEXT_PUBLIC_APP_NAME="aseanflow"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET**:

```bash
openssl rand -base64 32
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint         | Auth | Description               |
| ------ | ---------------- | ---- | ------------------------- |
| POST   | `/auth/register` | No   | Create new user account   |
| POST   | `/auth/login`    | No   | Login with email/password |
| POST   | `/auth/refresh`  | No   | Refresh access token      |
| POST   | `/auth/logout`   | Yes  | Logout current user       |
| GET    | `/auth/me`       | Yes  | Get current user profile  |

### Posts

| Method | Endpoint                 | Auth | Description                      |
| ------ | ------------------------ | ---- | -------------------------------- |
| GET    | `/posts`                 | No   | List posts (paginated, filtered) |
| GET    | `/posts/search?q=term`   | No   | Search posts                     |
| GET    | `/posts/by-tag/:tagSlug` | No   | Get posts by tag                 |
| GET    | `/posts/by-user/:userId` | No   | Get user's posts                 |
| GET    | `/posts/:slug`           | No   | Get single post                  |
| POST   | `/posts`                 | Yes  | Create new post                  |
| PATCH  | `/posts/:id`             | Yes  | Update post (owner only)         |
| POST   | `/posts/:id/publish`     | Yes  | Publish post (owner only)        |
| DELETE | `/posts/:id`             | Yes  | Delete post (owner only)         |

### Users

| Method | Endpoint           | Auth  | Description         |
| ------ | ------------------ | ----- | ------------------- |
| GET    | `/users/:id`       | No    | Get user profile    |
| GET    | `/users`           | Admin | List all users      |
| PATCH  | `/users/me`        | Yes   | Update own profile  |
| GET    | `/users/:id/posts` | No    | Get user's posts    |
| GET    | `/users/:id/stats` | No    | Get user statistics |

**Full API Documentation**: http://localhost:3001/api/docs (Swagger)

## Development

To start the development servers for both the frontend and backend, run:

```bash
pnpm dev
```

- The Next.js frontend will be available at `http://localhost:3000`.
- The Nest.js backend will be available at `http://localhost:3001`.

### Running services individually

- **Web (Next.js):** `pnpm dev --filter web` or `pnpm web:dev`
- **API (Nest.js):** `pnpm dev --filter api` or `pnpm api:dev`

## Database Management (Prisma)

The `packages/database` directory contains the Prisma schema and seed scripts.

- **Generate Prisma Client:** `pnpm db:generate`
- **Push schema changes:** `pnpm db:sync`
- **Seed the database:** `pnpm db:seed`
- **Open Prisma Studio:** `pnpm db:studio`

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                   Client (Browser)                            │
│  Next.js 16 · React 19 · NextAuth.js · TypeScript            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  useNextAuth() → Session Management                  │    │
│  │  Pages: Login, Register, Dashboard, Posts           │    │
│  │  Components: Forms, Cards, Navigation               │    │
│  │  State: NextAuth Session + React Query              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────┬────────────────────────────────────────────────┘
              │ Calls /api/* (Next.js API Routes)
              │ NO direct backend access
              │
┌─────────────▼────────────────────────────────────────────────┐
│           Next.js Server (Port 3000)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  NextAuth.js v5                                      │    │
│  │  - Credentials Provider                              │    │
│  │  - JWT Sessions (HTTP-only cookies)                  │    │
│  │  - /api/auth/[...nextauth]                           │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  API Proxy Routes (Server-Side)                      │    │
│  │  - /api/register → Backend /auth/register            │    │
│  │  - /api/posts → Backend /posts (+ Bearer token)      │    │
│  │  - /api/users/me → Backend /users/me (+ token)       │    │
│  │  ✓ Session validation                                │    │
│  │  ✓ Token injection                                   │    │
│  │  ✓ Error handling                                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────┬────────────────────────────────────────────────┘
              │ Server-to-Server HTTP
              │ Authorization: Bearer {accessToken}
              │
┌─────────────▼────────────────────────────────────────────────┐
│            Nest.js Backend API (Port 3001)                    │
│  TypeScript · Passport JWT · Validation · Swagger            │
│  ┌──────────────────┬──────────────────┬─────────────────┐  │
│  │  Auth Module     │  Posts Module    │  Users Module   │  │
│  │  - Register      │  - CRUD ops      │  - Profiles     │  │
│  │  - Login         │  - Search        │  - Statistics   │  │
│  │  - JWT tokens    │  - Tags          │  - Admin        │  │
│  │  - Verification  │  - Caching       │                 │  │
│  └──────────────────┴──────────────────┴─────────────────┘  │
└─────────────┬──────────────────────┬───────────────────────────┘
              │                      │
         ┌────▼────┐           ┌─────▼──────┐
         │PostgreSQL│           │   Redis    │
         │(Prisma) │           │            │
         │- Users  │           │- Sessions  │
         │- Posts  │           │- Cache     │
         │- Tags   │           │- Views     │
         └─────────┘           └────────────┘
```

**🔒 Security Benefits of API Proxy Pattern**:

- ✅ Backend URL hidden from browser
- ✅ Tokens in HTTP-only cookies (XSS protection)
- ✅ Server-side session validation
- ✅ No CORS configuration needed
- ✅ Centralized authentication logic

### Shared Packages (Type-Safe Communication)

```
@aseanflow/shared
  ├── schemas (Zod validation)
  ├── types (TypeScript interfaces)
  ├── constants (Error codes, limits)
  └── utils (Slug, date, validation)
        ↓
Used by both Frontend & Backend
```

## 📁 Monorepo Structure

```
aseanflow/
├── apps/
│   ├── api/                          # Nest.js Backend
│   │   ├── src/
│   │   │   ├── auth/                 # ✅ JWT Authentication Module
│   │   │   ├── posts/                # ✅ Posts CRUD Module
│   │   │   ├── users/                # ✅ Users Module
│   │   │   ├── common/               # Shared services (Prisma, Redis)
│   │   │   ├── app.module.ts         # Root module
│   │   │   └── main.ts               # Entry point
│   │   ├── test/                     # E2E tests
│   │   └── package.json
│   │
│   └── web/                          # Next.js Frontend
│       ├── app/
│       │   ├── (auth)/               # ✅ Auth pages (login, register)
│       │   ├── (app)/                # Protected routes (dashboard, posts)
│       │   ├── components/           # Component showcase
│       │   ├── layout.tsx            # Root layout
│       │   └── page.tsx              # Homepage
│       ├── components/
│       │   ├── auth/                 # ✅ Auth forms
│       │   ├── layout/               # Navigation, layouts
│       │   └── theme-toggle.tsx
│       ├── lib/
│       │   ├── api/                  # ✅ Type-safe API client
│       │   ├── context/              # ✅ Auth context
│       │   └── hooks/                # ✅ Data fetching hooks
│       └── package.json
│
├── packages/
│   ├── auth/                         # ✅ Authentication utilities
│   │   ├── src/
│   │   │   ├── password.ts           # bcrypt hashing
│   │   │   ├── jwt.ts                # Token generation
│   │   │   └── schemas.ts            # Validation schemas
│   │   └── package.json
│   │
│   ├── database/                     # ✅ Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Enhanced schema
│   │   │   └── seed.ts               # Seed script
│   │   ├── src/index.ts
│   │   └── package.json
│   │
│   ├── redis/                        # ✅ Redis caching
│   │   ├── src/
│   │   │   ├── client.ts             # Redis client
│   │   │   ├── cache.ts              # Generic cache
│   │   │   ├── session.ts            # Session management
│   │   │   └── post-cache.ts         # Post-specific caching
│   │   └── package.json
│   │
│   ├── shared/                       # ✅ Shared types & schemas
│   │   ├── src/
│   │   │   ├── schemas/              # Zod validation schemas
│   │   │   ├── types/                # TypeScript types
│   │   │   ├── constants/            # Error codes, limits
│   │   │   └── utils/                # Utility functions
│   │   └── package.json
│   │
│   ├── ui/                           # ✅ UI Components (shadcn/ui)
│   │   ├── src/
│   │   │   ├── components/           # Button, Card, Input, etc.
│   │   │   └── lib/                  # Design tokens, utils
│   │   └── package.json
│   │
│   ├── eslint-config/                # ESLint configurations
│   ├── tsconfig/                     # TypeScript configurations
│   └── prettier-config/              # Prettier configuration
│
├── docker-compose.dev.yml            # Dev services (Postgres, Redis)
├── docker-compose.yml                # Production config
├── turbo.json                        # Turbo build configuration
├── package.json                      # Root workspace config
├── pnpm-workspace.yaml               # pnpm workspace definition
└── IMPLEMENTATION_SUMMARY.md         # 📖 Detailed implementation docs
```

## Adding UI Components

To add new shadcn/ui components, run the following command from the root of the `apps/web` directory:

```bash
pnpm dlx shadcn@latest add <component-name>
```

This will add the component to the `packages/ui/src/components` directory, making it available across the monorepo via `@aseanflow/ui`.

## Testing

The monorepo includes comprehensive testing across different layers:

### Backend Testing (Jest)

```bash
cd apps/api
pnpm test              # Run unit tests
pnpm test:watch        # Watch mode
pnpm test:cov          # Coverage report
pnpm test:e2e          # End-to-end API tests
```

### Frontend Testing (Jest + Playwright)

```bash
cd apps/web
pnpm test              # Unit tests
pnpm test:e2e          # End-to-end tests
pnpm test:visual       # Visual regression tests
pnpm test:e2e:ui       # Interactive test runner
```

## Code Quality

- **Lint all packages:** `pnpm lint`
- **Fix linting issues:** `pnpm lint:fix`
- **Format code:** `pnpm format`
- **Type check:** `pnpm type-check`

## Building for Production

To build all applications and packages:

```bash
pnpm build
```

Individual builds:

```bash
pnpm build --filter web
pnpm build --filter api
```

## Deployment

The monorepo is ready for deployment with Docker:

```bash
# Production build
docker-compose up -d

# Or individual services
docker-compose up web
docker-compose up api
```

## 💎 What Makes This Template Special

Unlike basic boilerplates, this template includes:

- ✅ **75+ production-ready files** with ~8,400 lines of code
- ✅ **NextAuth.js v5 integration** - Industry-standard authentication with HTTP-only cookies
- ✅ **API Proxy Pattern** - Next.js routes proxy to backend for enhanced security
- ✅ **Complete authentication flow** (register, login, sessions, protected routes, middleware)
- ✅ **Full CRUD implementation** with caching, pagination, search, filtering
- ✅ **Type-safe end-to-end** - Shared schemas between frontend and backend
- ✅ **Redis caching strategies** - Sessions, posts, trending, with auto invalidation
- ✅ **Real-world patterns** - Not just "Hello World", but production-grade code
- ✅ **Comprehensive testing** - Unit tests, E2E tests, mocks included
- ✅ **Security best practices** - HTTP-only cookies, server-side validation, RBAC
- ✅ **Developer experience** - NextAuth, Swagger docs, type checking, hot reload
- ✅ **Next.js 16 features** - Latest framework with React 19 Server Components

## 📚 Documentation

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Detailed technical documentation with 7,600+ LOC breakdown
- **[NEXTAUTH_UPGRADE_SUMMARY.md](./NEXTAUTH_UPGRADE_SUMMARY.md)** - NextAuth.js v5 & API proxy implementation guide
- **[Backend API Docs](http://localhost:3001/api/docs)** - Interactive Swagger/OpenAPI documentation
- **[Package READMEs](./packages/)** - Individual package documentation in each package directory

## 🤝 Contributing to Aseanflow Projects

This template serves as the foundation for Aseanflow projects. When using this template:

1. **Follow the established patterns** in each package
2. **Maintain type safety** across the stack
3. **Write tests** for new features
4. **Update documentation** when adding new functionality
5. **Use the shared packages** instead of duplicating code
6. **Follow the Aseanflow coding standards** defined in ESLint configs

## 🎯 Use Cases

This template is perfect for:

- **SaaS applications** - User management, subscriptions, features
- **Content management** - Blogs, documentation, knowledge bases
- **Social platforms** - User profiles, posts, interactions
- **E-commerce** - Product catalogs, user accounts, orders
- **Internal tools** - Admin dashboards, CRUD interfaces
- **Learning projects** - Study production-grade fullstack architecture

## 🚀 Next Steps After Setup

1. Customize the database schema in `packages/database/prisma/schema.prisma`
2. Add more API endpoints in `apps/api/src/`
3. Create frontend pages in `apps/web/app/`
4. Add UI components to `packages/ui/`
5. Configure deployment (Vercel, Railway, AWS, etc.)
6. Add monitoring and analytics
7. Set up CI/CD pipeline

## 📊 Project Statistics

| Metric              | Value                                              |
| ------------------- | -------------------------------------------------- |
| Total Files Created | 67+                                                |
| Lines of Code       | ~7,600                                             |
| Packages            | 9                                                  |
| API Endpoints       | 22                                                 |
| Test Files          | 6+                                                 |
| Documentation Pages | 3                                                  |
| Supported Features  | Authentication, CRUD, Caching, Search, Tags, Roles |

## 🔗 Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nest.js Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source tools:

- TypeScript, Next.js, Nest.js, Prisma, Redis
- React, shadcn/ui, Radix UI, Tailwind CSS
- Zod, Axios, Passport, bcrypt, JWT
- Jest, Playwright, Docker, pnpm, Turbo

---

**Built with ❤️ by Aseanflow**

**Star ⭐ this repository if you find it useful!**
