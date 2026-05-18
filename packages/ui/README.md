# @aseanflow/ui - Component Library

Shared React component library built on shadcn/ui and Radix UI primitives with Tailwind CSS v4. Provides a comprehensive design system with consistent styling, animations, theme support, and utility functions.

## Features

- **shadcn/ui Components** with custom Aseanflow styling
- **Radix UI Primitives** for accessibility and keyboard navigation
- **Tailwind CSS v4** with design tokens and utilities
- **Theme System** with dark/light mode support
- **Class Variance Authority** for consistent component variants
- **TypeScript** strict mode with full type safety
- **Jest Testing** with React Testing Library
- **ESM Module** with proper exports mapping

## Installation

This package is part of the @aseanflow monorepo and should be used as a workspace dependency:

```json
{
  "dependencies": {
    "@aseanflow/ui": "workspace:*"
  }
}
```

## Usage

### Importing Components

```tsx
// Import individual components
import { Button } from "@aseanflow/ui/components/button";
import { Card } from "@aseanflow/ui/components/card";
import { Input } from "@aseanflow/ui/components/input";

// Import utilities
import { cn } from "@aseanflow/ui/lib/utils";

// Import styles (in your app's root layout)
import "@aseanflow/ui/globals.css";
```

### Basic Component Usage

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "@aseanflow/ui";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Aseanflow</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="lg">
          Get Started
        </Button>
        <Button variant="webgenix" size="sm">
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Theme Integration

```tsx
import { ThemeProvider } from "next-themes";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* Your app content */}
    </ThemeProvider>
  );
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
pnpm dev --filter ui
```

From this directory:

```bash
# Build the package
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

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
| `pnpm test:watch` | Run Jest in watch mode        |
| `pnpm type-check` | Run TypeScript compiler check |
| `pnpm lint`       | Run ESLint                    |

## Package Exports

The package provides multiple export paths for optimal tree-shaking:

```typescript
// Main exports (components, utilities, hooks)
import { Button, cn, useTheme } from "@aseanflow/ui";

// Individual component imports (recommended)
import { Button } from "@aseanflow/ui/components/button";
import { Card } from "@aseanflow/ui/components/card";

// Utility imports
import { cn } from "@aseanflow/ui/lib/utils";

// Hook imports
import { useTheme } from "@aseanflow/ui/hooks/use-theme";

// Style imports
import "@aseanflow/ui/globals.css";

// Configuration imports
import tailwindConfig from "@aseanflow/ui/tailwind.config";
import postcssConfig from "@aseanflow/ui/postcss.config";
```

## Available Components

### Form Components

- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link, webgenix)
- **Input**: Text input with proper styling and validation states
- **Label**: Form labels with proper accessibility
- **Switch**: Toggle switch component

### Layout Components

- **Card**: Container with header, content, and footer sections
- **Separator**: Visual divider component

### Utility Components

- **Slot**: Radix Slot primitive for composition

## Component Variants

Components use Class Variance Authority (CVA) for consistent variants:

```tsx
// Button variants
<Button variant="default">Default</Button>
<Button variant="webgenix">Aseanflow Branded</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

## Styling

### Tailwind Configuration

Extend from this package's Tailwind config in your app:

```javascript
// tailwind.config.js
import baseConfig from "@aseanflow/ui/tailwind.config";

export default {
  // Extend the base config
  ...baseConfig,
  content: [
    // Add your app's content paths
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Include the UI package content
    "./node_modules/@aseanflow/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
```

### CSS Import

Import the global styles in your app's root layout:

```tsx
// app/layout.tsx or pages/_app.tsx
import "@aseanflow/ui/globals.css";
```

### Custom Utilities

The package includes utility functions for className management:

```tsx
import { cn } from "@aseanflow/ui/lib/utils";

// Merge classes with proper precedence
const className = cn(
  "base-class",
  "conditional-class",
  condition && "conditional-class",
  props.className,
);
```

## Theme Support

The library supports dark/light mode through CSS variables and next-themes:

### CSS Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... more variables */
}
```

### Theme Toggle Component

```tsx
import { useTheme } from "next-themes";
import { Button } from "@aseanflow/ui";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      Toggle Theme
    </Button>
  );
}
```

## Testing

The package includes comprehensive tests for all components:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test --coverage
```

### Testing Example

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

test("renders button with correct variant", () => {
  render(<Button variant="webgenix">Click me</Button>);
  const button = screen.getByRole("button", { name: /click me/i });
  expect(button).toHaveClass("webgenix-variant-class");
});
```

## Adding New Components

When adding components from shadcn/ui:

1. Run from the web app root:

   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```

2. This will add the component to `packages/ui/src/components/`

3. Export the component from `src/index.ts`

4. Write tests for the new component

5. Update this README if needed

## Contributing

1. Follow the established component patterns
2. Use Radix UI primitives where possible
3. Apply consistent styling with CVA variants
4. Write comprehensive tests
5. Ensure accessibility compliance
6. Update documentation for new components

## Dependencies

### Production

- **@radix-ui/react-\*\*\***: Accessible component primitives
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging
- **next-themes**: Theme switching
- **lucide-react**: Icon library
- **zod**: Runtime validation

### Development

- **@aseanflow/eslint-config**: Shared linting rules
- **@aseanflow/tsconfig**: Shared TypeScript configuration
- **@testing-library/react**: React testing utilities
- **jest**: Testing framework

---

For more information about the overall monorepo structure, see the [main README](../../README.md).
