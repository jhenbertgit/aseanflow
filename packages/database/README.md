# @aseanflow/database - Database Package

Centralized Prisma ORM package providing type-safe database access, schema management, and seeding utilities. Includes the Prisma client, schema definitions, migrations, and development tools for PostgreSQL database operations.

## Features

- **Prisma ORM** with PostgreSQL database
- **Type-safe** database queries with full TypeScript support
- **Schema Management** with migrations and versioning
- **Database Seeding** for development and testing
- **Connection Management** with pooling and optimization
- **Development Tools** including Prisma Studio
- **ESM Module** with proper TypeScript exports

## Installation

This package is part of the @aseanflow monorepo and should be used as a workspace dependency:

```json
{
  "dependencies": {
    "@aseanflow/database": "workspace:*"
  }
}
```

## Usage

### Importing the Prisma Client

```typescript
// Import the configured Prisma client
import { prisma } from "@aseanflow/database";

// Or import the PrismaService (for Nest.js)
import { PrismaService } from "@aseanflow/database";

// Or import types
import type { User, Post } from "@aseanflow/database";
```

### Basic Database Operations

```typescript
import { prisma } from "@aseanflow/database";

// Create a user
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe",
    password: "hashed-password",
  },
});

// Find users
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: "example.com",
    },
  },
  include: {
    posts: true,
  },
});

// Update a user
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Jane Doe" },
});

// Delete a user
await prisma.user.delete({
  where: { id: 1 },
});
```

### Using with Nest.js

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@aseanflow/database";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }
}
```

## Development

### Prerequisites

- Node.js ≥20
- pnpm 10.4.1+
- Docker (PostgreSQL running)
- Environment variables configured

### Setup

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Start database services
docker-compose -f docker-compose.dev.yml up -d

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed database
pnpm db:seed
```

From this directory:

```bash
# Generate Prisma client
pnpm generate

# Push schema changes
pnpm push

# Create and apply migration
pnpm migrate

# Open Prisma Studio
pnpm studio

# Seed database
pnpm seed
```

## Scripts

| Script            | Description                                 |
| ----------------- | ------------------------------------------- |
| `pnpm generate`   | Generate Prisma client after schema changes |
| `pnpm push`       | Push schema to database (development)       |
| `pnpm migrate`    | Create and apply migration (production)     |
| `pnpm studio`     | Open Prisma Studio database GUI             |
| `pnpm seed`       | Run database seeding script                 |
| `pnpm build`      | Build TypeScript to dist/                   |
| `pnpm dev`        | Build in watch mode                         |
| `pnpm type-check` | Run TypeScript compiler check               |
| `pnpm lint`       | Run ESLint                                  |

## Configuration

### Environment Variables

Create a `.env` file in the monorepo root or this directory:

```env
# Database URL for development
DATABASE_URL="postgresql://user:password@localhost:5432/tn3pr_dev"

# Database URL for testing (optional)
DATABASE_URL_TEST="postgresql://user:password@localhost:5432/tn3pr_test"

# Connection pool settings (optional)
DATABASE_CONNECTION_LIMIT=10
```

### Database Schema

The Prisma schema is located at `prisma/schema.prisma`:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]

  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

## Database Operations

### Schema Changes

1. **Development**: Use `push` for rapid prototyping

   ```bash
   # Edit prisma/schema.prisma
   pnpm push
   ```

2. **Production**: Use `migrate` for versioned changes
   ```bash
   # Edit prisma/schema.prisma
   pnpm migrate
   # This creates a migration file in prisma/migrations/
   ```

### Client Generation

Always regenerate the client after schema changes:

```bash
# Generate client
pnpm generate

# Client is generated to: generated/prisma/
```

### Database Seeding

Seed the database with initial data:

```bash
# Run seeding script
pnpm seed
```

The seed script is located at `prisma/seed.ts`:

```typescript
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create seed data
  const user = await prisma.user.create({
    data: {
      email: "admin@aseanflow.com",
      name: "Admin User",
      password: "hashed-password",
      posts: {
        create: [
          {
            title: "Welcome to Aseanflow",
            content: "This is our first post!",
            published: true,
          },
        ],
      },
    },
  });

  console.log(`Created user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Prisma Studio

Explore your database with the visual editor:

```bash
# Open Prisma Studio
pnpm studio

# Available at: http://localhost:5555
```

## Migrations

### Development Workflow

```bash
# 1. Edit schema
# 2. Create and apply migration
pnpm migrate

# 3. Generate client
pnpm generate
```

### Migration Files

Migrations are stored in `prisma/migrations/`:

```
prisma/migrations/
├── 20240101000000_init/
│   └── migration.sql
├── 20240102000000_add_posts/
│   └── migration.sql
└── migration_lock.toml
```

### Production Deployment

```bash
# Deploy pending migrations
npx prisma migrate deploy

# Or using the package script
pnpm migrate:deploy
```

## Query Examples

### Basic Queries

```typescript
// Find all users
const users = await prisma.user.findMany();

// Find user by email
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
});

// Find users with posts
const usersWithPosts = await prisma.user.findMany({
  include: { posts: true },
});
```

### Advanced Queries

```typescript
// Pagination
const users = await prisma.user.findMany({
  skip: 20,
  take: 10,
  orderBy: { createdAt: "desc" },
});

// Filtering and relations
const publishedPosts = await prisma.post.findMany({
  where: {
    published: true,
    author: {
      email: { endsWith: "@aseanflow.com" },
    },
  },
  include: {
    author: { select: { name: true, email: true } },
  },
});

// Aggregations
const stats = await prisma.user.aggregate({
  _count: { id: true },
  _avg: { id: true },
});
```

### Transactions

```typescript
// Using interactive transactions
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: "user@example.com", name: "User" },
  });

  const post = await tx.post.create({
    data: {
      title: "First Post",
      authorId: user.id,
    },
  });

  return { user, post };
});
```

## Testing

### Test Database Setup

Create a separate test database:

```bash
# Set TEST_DATABASE_URL in .env.test
DATABASE_URL_TEST="postgresql://user:password@localhost:5432/tn3pr_test"

# Push schema to test database
DATABASE_URL=$DATABASE_URL_TEST pnpm push
```

### Test Helpers

```typescript
// test-helpers.ts
import { PrismaClient } from "@aseanflow/database";

export const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_TEST },
  },
});

export async function cleanDatabase() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
}
```

## Performance

### Connection Pooling

Configure connection pooling in your DATABASE_URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?connection_limit=20&pool_timeout=20"
```

### Query Optimization

```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
  }
})

// Use indexes in your schema
model User {
  email String @unique @db.VarChar(255)

  @@index([createdAt])
  @@index([email, createdAt])
}
```

## Troubleshooting

### Common Issues

1. **Schema not in sync**: Run `pnpm generate` after schema changes
2. **Migration conflicts**: Reset database in development with `pnpm db:reset`
3. **Connection issues**: Check DATABASE_URL and ensure PostgreSQL is running
4. **Type errors**: Regenerate client with `pnpm generate`

### Reset Database (Development Only)

```bash
# WARNING: This deletes all data
npx prisma migrate reset

# Or using Docker
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

## Contributing

1. Always create migrations for schema changes in production
2. Test database operations thoroughly
3. Use transactions for multi-step operations
4. Follow naming conventions (snake_case for database, camelCase for TypeScript)
5. Add appropriate indexes for performance
6. Update seed scripts when adding new required fields

---

For more information about the overall monorepo structure, see the [main README](../../README.md).
