# Contributing to Aseanflow Projects

Thank you for your interest in contributing! This guide explains the coding standards, best practices, and workflows for projects built with the aseanflow starter template.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)
- [Testing Guidelines](#testing-guidelines)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Be respectful and constructive in communication
- Welcome and mentor newcomers
- Focus on what is best for the project and community
- Show empathy towards other community members
- Accept constructive criticism gracefully

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Publishing others' private information
- Deliberately introducing bugs or security vulnerabilities
- Other conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

Ensure you have the required tools installed:

- Node.js ≥ 20
- pnpm ≥ 10.4.1
- Docker (for local development)
- Git

### Initial Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/your-project.git
cd your-project

# 2. Install dependencies
pnpm install

# 3. Start development services
docker-compose -f docker-compose.dev.yml up -d

# 4. Setup database
pnpm db:generate
pnpm db:sync
pnpm db:seed

# 5. Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 6. Start development servers
pnpm dev
```

### Development Environment

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs
- Prisma Studio: `pnpm db:studio`

## Development Workflow

### Branch Strategy

Follow a feature-branch workflow:

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description

# Or for documentation
git checkout -b docs/documentation-update
```

### Making Changes

1. **Create a feature branch** from `main`
2. **Make your changes** following coding standards
3. **Write or update tests** for your changes
4. **Run linting and type checks**:
   ```bash
   pnpm lint
   pnpm type-check
   ```
5. **Run tests** to ensure nothing is broken:
   ```bash
   pnpm test
   ```
6. **Commit your changes** using conventional commits
7. **Push to your fork** and create a pull request

### Before Committing

Always run these commands before committing:

```bash
# Format code
pnpm format

# Lint all packages
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test

# Build to ensure no build errors
pnpm build
```

## Coding Standards

### TypeScript

**Always use strict TypeScript:**

```typescript
// ✅ Good - Explicit types
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  return db.user.findUnique({ where: { id } });
}

// ❌ Bad - Implicit any
function getUser(id) {
  return db.user.findUnique({ where: { id } });
}
```

**Use type inference when obvious:**

```typescript
// ✅ Good - Type is obvious from value
const count = 5;
const users = await db.user.findMany();

// ❌ Bad - Redundant type annotation
const count: number = 5;
```

**Prefer interfaces over types for object shapes:**

```typescript
// ✅ Good - Interface for object shapes
interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
}

// ✅ Good - Type for unions/intersections
type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
type AuthenticatedUser = User & { accessToken: string };
```

### Naming Conventions

**Variables and Functions:**
- Use `camelCase` for variables and functions
- Use descriptive names that explain intent
- Avoid abbreviations unless well-known

```typescript
// ✅ Good
const userProfile = await getUserProfile(userId);
const isAuthenticated = checkAuthStatus();

// ❌ Bad
const up = await getUP(uid);
const auth = check();
```

**Components:**
- Use `PascalCase` for React components
- Use descriptive, specific names

```typescript
// ✅ Good
export function UserProfileCard({ user }: UserProfileCardProps) {
  // ...
}

// ❌ Bad
export function Card({ user }: Props) {
  // ...
}
```

**Constants:**
- Use `SCREAMING_SNAKE_CASE` for true constants
- Group related constants in objects or enums

```typescript
// ✅ Good
const MAX_FILE_SIZE = 5_000_000;
const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
} as const;

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}
```

**Files and Directories:**
- Use `kebab-case` for files and directories
- Component files: `user-profile-card.tsx`
- Utility files: `format-date.ts`
- Test files: `user-service.spec.ts`

### Code Organization

**Import Order:**
1. External packages
2. Internal packages (`@namespace/*`)
3. Relative imports (components, utils, types)
4. Type imports (if separate)

```typescript
// ✅ Good
import { useState } from 'react';
import { useSession } from 'next-auth/react';

import { Button } from '@mycompany/ui';
import { validateEmail } from '@mycompany/shared';

import { UserAvatar } from './user-avatar';
import { formatDate } from '../utils/format-date';
import type { UserProfile } from '../types';
```

**File Structure:**
- Keep files under 300 lines
- One component per file (except tightly coupled components)
- Collocate related files in feature directories

### Backend (Nest.js)

**Module Structure:**

```typescript
// ✅ Good - Clear separation of concerns
@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

**Service Methods:**

```typescript
// ✅ Good - Descriptive method names, proper error handling
async createPost(userId: string, dto: CreatePostDto): Promise<Post> {
  const user = await this.db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException(`User ${userId} not found`);
  }

  const post = await this.db.post.create({
    data: {
      ...dto,
      authorId: userId,
      slug: slugify(dto.title),
    },
  });

  await this.cache.invalidateUserPosts(userId);
  return post;
}
```

**DTOs with Validation:**

```typescript
// ✅ Good - Use class-validator decorators
export class CreatePostDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
```

### Frontend (Next.js)

**Server vs Client Components:**

```typescript
// ✅ Good - Server Component (default)
export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}

// ✅ Good - Client Component (when needed)
'use client';
export function InteractivePostCard({ post }: Props) {
  const [liked, setLiked] = useState(false);
  // ... interactive logic
}
```

**Data Fetching:**

```typescript
// ✅ Good - Server-side data fetching
async function getPosts() {
  const response = await fetch('http://localhost:3001/api/posts', {
    cache: 'no-store', // or 'force-cache' depending on use case
  });
  return response.json();
}

// ✅ Good - Client-side with custom hooks
function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile(userId).then(setProfile).finally(() => setLoading(false));
  }, [userId]);

  return { profile, loading };
}
```

**Form Handling:**

```typescript
// ✅ Good - Type-safe form with validation
import { z } from 'zod';
import { loginSchema } from '@mycompany/shared';

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    await login(result.data);
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Shared Packages

**Zod Schemas:**

```typescript
// ✅ Good - Reusable validation schemas
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
```

**Type Exports:**

```typescript
// ✅ Good - Export both schema and inferred type
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export type User = z.infer<typeof userSchema>;
```

### Error Handling

**Backend Error Handling:**

```typescript
// ✅ Good - Specific error types
try {
  const user = await this.db.user.findUniqueOrThrow({ where: { id } });
  return user;
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
  throw new InternalServerErrorException('Failed to fetch user');
}
```

**Frontend Error Handling:**

```typescript
// ✅ Good - User-friendly error messages
async function handleLogin(data: LoginInput) {
  try {
    const result = await signIn('credentials', {
      ...data,
      redirect: false,
    });

    if (!result.ok) {
      toast.error('Invalid email or password');
      return;
    }

    router.push('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    toast.error('An unexpected error occurred. Please try again.');
  }
}
```

## Project Structure

### Adding New Features

When adding a feature, follow this structure:

**Backend Module:**
```
apps/api/src/feature-name/
├── dto/
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── query-feature.dto.ts
├── entities/
│   └── feature.entity.ts
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── __tests__/
    ├── feature.controller.spec.ts
    └── feature.service.spec.ts
```

**Frontend Feature:**
```
apps/web/app/(protected)/feature-name/
├── page.tsx
├── loading.tsx
├── error.tsx
├── components/
│   ├── feature-list.tsx
│   ├── feature-card.tsx
│   └── feature-form.tsx
└── lib/
    ├── api.ts
    └── hooks.ts
```

## Testing Guidelines

### Unit Tests

**Backend Service Tests:**

```typescript
describe('PostsService', () => {
  let service: PostsService;
  let db: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    db = module.get<PrismaService>(PrismaService);
  });

  it('should create a post', async () => {
    const createDto = { title: 'Test Post', content: 'Content' };
    const expected = { id: '1', ...createDto };

    jest.spyOn(db.post, 'create').mockResolvedValue(expected as any);

    const result = await service.create('user-1', createDto);
    expect(result).toEqual(expected);
  });
});
```

**Frontend Component Tests:**

```typescript
import { render, screen } from '@testing-library/react';
import { UserCard } from './user-card';

describe('UserCard', () => {
  it('renders user information', () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    };

    render(<UserCard user={user} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

### Test Coverage Goals

- Aim for **80%+ coverage** on critical business logic
- **100% coverage** on shared packages (validation, utilities)
- Focus on **behavior**, not implementation details
- Write **integration tests** for critical user flows

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, or tooling changes
- `ci`: CI/CD configuration changes

### Scopes

- `web`: Frontend (Next.js app)
- `api`: Backend (Nest.js app)
- `ui`: UI components package
- `auth`: Authentication package
- `database`: Database/Prisma package
- `redis`: Redis package
- `shared`: Shared package
- `docs`: Documentation
- `config`: Configuration files

### Examples

```bash
# Feature addition
feat(web): add user profile editing form

# Bug fix
fix(api): resolve null reference error in posts service

# Documentation
docs: update CONTRIBUTING.md with testing guidelines

# Refactoring
refactor(shared): simplify validation schema composition

# Performance improvement
perf(api): add database query indexing for posts

# Dependency update
chore(deps): update Next.js to version 16.1.0
```

### Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the footer:

```
feat(auth)!: migrate to NextAuth.js v5

BREAKING CHANGE: NextAuth.js v4 configuration is no longer compatible.
See migration guide in docs/migrations/nextauth-v5.md
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks**:
   ```bash
   pnpm lint
   pnpm type-check
   pnpm test
   pnpm build
   ```

3. **Update documentation** if needed

4. **Write a clear PR description**

### PR Description Template

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes

- Change 1
- Change 2
- Change 3

## Testing

Describe how you tested these changes:

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

- All PRs require **at least one approval**
- Address all review comments
- Keep PRs **focused and small** (< 500 lines when possible)
- Respond to feedback **within 2 business days**

### After Approval

1. **Squash and merge** for feature branches
2. **Update changelog** if using changesets
3. **Delete branch** after merging

## Questions or Issues?

- Check existing issues and documentation first
- Use GitHub Discussions for questions
- Create an issue for bugs or feature requests
- Join our community chat (if available)

---

**Thank you for contributing to make this project better!** 🎉
