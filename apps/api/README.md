# @aseanflow/api - Backend API Server

Nest.js backend API server with comprehensive testing, JWT authentication, rate limiting, and Swagger documentation. Integrates with PostgreSQL via Prisma and Redis for caching.

## Features

- **Nest.js** progressive Node.js framework
- **JWT Authentication** with Passport.js integration
- **Prisma ORM** for type-safe database operations
- **Redis** caching and session management
- **Swagger** API documentation
- **Rate Limiting** for API protection
- **Comprehensive Testing** with Jest (unit, integration, E2E)
- **Validation** with class-validator and class-transformer
- **TypeScript** strict mode with shared types

## Development

### Prerequisites

- Node.js ≥20
- pnpm 10.4.1+
- Docker (PostgreSQL + Redis services running)
- Database schema synced (`pnpm db:generate && pnpm db:push`)

### Quick Start

From the monorepo root:

```bash
# Start all services
pnpm dev

# Or start only API server
pnpm dev --filter api
```

From this directory:

```bash
# Install dependencies (if not done from root)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start:prod
```

The API will be available at `http://localhost:3001`.

## Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Start development server with watch mode |
| `pnpm start`       | Start server                             |
| `pnpm start:debug` | Start with debugging enabled             |
| `pnpm start:prod`  | Start production server                  |
| `pnpm build`       | Build for production                     |
| `pnpm lint`        | Run ESLint                               |
| `pnpm lint:fix`    | Fix ESLint issues                        |
| `pnpm type-check`  | Run TypeScript compiler check            |

### Testing Scripts

| Script            | Description                    |
| ----------------- | ------------------------------ |
| `pnpm test`       | Run Jest unit tests            |
| `pnpm test:watch` | Run Jest in watch mode         |
| `pnpm test:cov`   | Run tests with coverage report |
| `pnpm test:debug` | Debug tests                    |
| `pnpm test:e2e`   | Run E2E integration tests      |

### Database Scripts

| Script             | Description                  |
| ------------------ | ---------------------------- |
| `pnpm db:generate` | Generate Prisma client       |
| `pnpm db:push`     | Push schema to database      |
| `pnpm db:migrate`  | Run database migrations      |
| `pnpm db:seed`     | Seed database with test data |

## Configuration

### Environment Variables

Create a `.env` file in this directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tn3pr_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1h"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Application
PORT=3001
NODE_ENV=development
```

### Swagger Documentation

API documentation is automatically generated and available at:

- Development: `http://localhost:3001/api`

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e
```

## Database Integration

The API uses `@aseanflow/database` package for database operations:

```typescript
import { PrismaService } from '@aseanflow/database';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
```

## Contributing

1. Follow Nest.js architectural patterns (modules, controllers, services)
2. Write DTOs for request/response validation
3. Use guards for authentication and authorization
4. Write comprehensive tests (unit and E2E)
5. Document API endpoints with Swagger decorators
6. Follow TypeScript strict mode guidelines
7. Use shared types from @aseanflow/shared

---

For more information about the overall monorepo structure, see the [main README](../../README.md).
