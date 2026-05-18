# @aseanflow/shared - Shared Utilities

Centralized package for shared types, utilities, validation schemas, and business logic used across the TN³PR stack monorepo. Ensures type safety and consistency between frontend and backend applications while preventing code duplication.

## Features

- **Shared Types** for consistent data structures
- **Zod Validation Schemas** for runtime validation and static type inference
- **Business Logic** utilities and pure functions
- **Constants** and configuration values
- **Error Handling** utilities and standardized error types
- **Data Transformers** for normalization and conversion
- **API Contracts** with request/response types
- **TypeScript** strict mode with full type safety

## Installation

This package is part of the @aseanflow monorepo and should be used as a workspace dependency:

```json
{
  "dependencies": {
    "@aseanflow/shared": "workspace:*"
  }
}
```

## Usage

### Importing Types and Utilities

```typescript
// Import types
import type { User, Post, CreateUserDto, ApiResponse } from "@aseanflow/shared";

// Import validation schemas
import { userSchema, postSchema, loginSchema } from "@aseanflow/shared";

// Import utilities
import { formatDate, generateId, validateEmail } from "@aseanflow/shared";

// Import constants
import {
  API_ROUTES,
  ERROR_MESSAGES,
  DEFAULT_PAGE_SIZE,
} from "@aseanflow/shared";

// Import error utilities
import { AppError, ValidationError, NotFoundError } from "@aseanflow/shared";
```

### Type Definitions

```typescript
// User-related types
export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

// API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Validation Schemas

```typescript
import { z } from "zod";

// User validation schemas
export const userSchema = z.object({
  id: z.number().positive(),
  email: z.string().email(),
  name: z.string().min(1).max(255).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255).optional(),
  password: z.string().min(8).max(255),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// API response schema
export const apiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    data: dataSchema,
    message: z.string(),
    success: z.boolean(),
    timestamp: z.string(),
  });
```

### Using Schemas for Validation

```typescript
import { createUserSchema } from "@aseanflow/shared";

// Frontend form validation
function validateUserForm(formData: unknown) {
  try {
    const validData = createUserSchema.parse(formData);
    return { success: true, data: validData };
  } catch (error) {
    return { success: false, error };
  }
}

// Backend API validation
import { Request, Response, NextFunction } from "express";

function validateCreateUser(req: Request, res: Response, next: NextFunction) {
  try {
    createUserSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid request data" });
  }
}
```

## Development

### Prerequisites

- Node.js ≥20
- pnpm 10.4.1+

### Setup

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Start development mode
pnpm dev --filter shared
```

From this directory:

```bash
# Build the package
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Scripts

| Script            | Description                   |
| ----------------- | ----------------------------- |
| `pnpm build`      | Build TypeScript to dist/     |
| `pnpm dev`        | Build in watch mode           |
| `pnpm test`       | Run Jest unit tests           |
| `pnpm type-check` | Run TypeScript compiler check |
| `pnpm lint`       | Run ESLint                    |
| `pnpm lint:fix`   | Fix ESLint issues             |

## Package Structure

```
packages/shared/
├── src/
│   ├── index.ts           # Main exports
│   ├── types/
│   │   ├── user.ts        # User-related types
│   │   ├── post.ts        # Post-related types
│   │   ├── api.ts         # API types
│   │   └── common.ts      # Common types
│   ├── schemas/
│   │   ├── user.ts        # User validation schemas
│   │   ├── post.ts        # Post validation schemas
│   │   └── auth.ts        # Authentication schemas
│   ├── utils/
│   │   ├── date.ts        # Date utilities
│   │   ├── string.ts      # String utilities
│   │   ├── validation.ts  # Validation utilities
│   │   └── format.ts      # Formatting utilities
│   ├── constants/
│   │   ├── api.ts         # API constants
│   │   ├── errors.ts      # Error messages
│   │   └── config.ts      # Configuration values
│   └── errors/
│       ├── base.ts        # Base error classes
│       ├── api.ts         # API error classes
│       └── validation.ts  # Validation error classes
└── package.json
```

## Utility Functions

### Date Utilities

```typescript
import { formatDate, parseDate, isValidDate } from "@aseanflow/shared";

// Format dates consistently
const formatted = formatDate(new Date()); // "2024-01-01T00:00:00.000Z"

// Parse date strings
const parsed = parseDate("2024-01-01"); // Date object

// Validate dates
const isValid = isValidDate("2024-01-01"); // true
```

### String Utilities

```typescript
import { slugify, capitalize, truncate, generateId } from "@aseanflow/shared";

// Create URL-friendly slugs
const slug = slugify("Hello World!"); // "hello-world"

// Capitalize strings
const capitalized = capitalize("hello world"); // "Hello World"

// Truncate text
const truncated = truncate("Long text...", 10); // "Long te..."

// Generate unique IDs
const id = generateId(); // "abc123def456"
```

### Validation Utilities

```typescript
import { validateEmail, validateUrl, sanitizeHtml } from "@aseanflow/shared";

// Email validation
const isValidEmail = validateEmail("user@example.com"); // true

// URL validation
const isValidUrl = validateUrl("https://example.com"); // true

// HTML sanitization
const clean = sanitizeHtml('<script>alert("xss")</script>Hello'); // "Hello"
```

## Constants

### API Routes

```typescript
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    GET: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },
} as const;
```

### Error Messages

```typescript
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: "This field is required",
    EMAIL: "Please enter a valid email address",
    PASSWORD: "Password must be at least 8 characters long",
  },
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Your session has expired",
    UNAUTHORIZED: "You are not authorized to perform this action",
  },
  GENERAL: {
    NOT_FOUND: "The requested resource was not found",
    SERVER_ERROR: "An unexpected error occurred",
  },
} as const;
```

### Configuration

```typescript
export const CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 255,
    NAME_MAX_LENGTH: 255,
  },
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
  },
} as const;
```

## Error Handling

### Base Error Classes

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}
```

### Usage

```typescript
import { ValidationError, NotFoundError } from "@aseanflow/shared";

// Throw validation errors
if (!email) {
  throw new ValidationError("Email is required", "email");
}

// Throw not found errors
const user = await findUserById(id);
if (!user) {
  throw new NotFoundError("User");
}
```

## Testing

### Unit Tests

```typescript
import { validateEmail, formatDate } from "@aseanflow/shared";

describe("Validation utilities", () => {
  test("validateEmail should return true for valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
  });
});

describe("Date utilities", () => {
  test("formatDate should format dates consistently", () => {
    const date = new Date("2024-01-01");
    expect(formatDate(date)).toBe("2024-01-01T00:00:00.000Z");
  });
});
```

### Schema Validation Tests

```typescript
import { createUserSchema } from "@aseanflow/shared";

describe("User schemas", () => {
  test("createUserSchema should validate correct data", () => {
    const validData = {
      email: "user@example.com",
      name: "John Doe",
      password: "password123",
    };

    expect(() => createUserSchema.parse(validData)).not.toThrow();
  });

  test("createUserSchema should reject invalid email", () => {
    const invalidData = {
      email: "invalid-email",
      name: "John Doe",
      password: "password123",
    };

    expect(() => createUserSchema.parse(invalidData)).toThrow();
  });
});
```

## Best Practices

### Type Safety

```typescript
// Use branded types for IDs
export type UserId = number & { __brand: "UserId" };
export type PostId = number & { __brand: "PostId" };

// Create type-safe ID functions
export function createUserId(id: number): UserId {
  return id as UserId;
}
```

### Schema Design

```typescript
// Compose schemas for reusability
const baseEntitySchema = z.object({
  id: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userSchema = baseEntitySchema.extend({
  email: z.string().email(),
  name: z.string().nullable(),
});
```

### Error Handling

```typescript
// Create specific error types
export class UserNotFoundError extends NotFoundError {
  constructor(userId: number) {
    super(`User with ID ${userId}`);
    this.name = "UserNotFoundError";
  }
}
```

## Contributing

1. Keep utilities pure and stateless
2. Design schemas for reusability across contexts
3. Export types separately from runtime code
4. Write comprehensive tests for all utilities
5. Document complex types and schemas
6. Avoid circular dependencies with other packages
7. Version API contracts carefully

---

For more information about the overall monorepo structure, see the [main README](../../README.md).
