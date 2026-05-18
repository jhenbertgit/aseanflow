import { config } from "../eslint-config/base.js"
import globals from "globals"

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: ["generated/**/*"],
  },
  ...config,
  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["prisma/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        exports: "writable",
        module: "writable",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
      sourceType: "commonjs",
    },
  },
]