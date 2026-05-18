import { nextJsConfig } from "@aseanflow/eslint-config/next.js"

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: [
      ".next/**",
      ".next",
      ".turbo/**",
      ".turbo",
      "out/**",
      "out",
      "node_modules/**",
      "node_modules",
      "dist/**",
      "dist",
      "build/**",
      "build",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },
  ...nextJsConfig,
]
