// This configuration only applies to the package manager root.
import { config } from "./packages/eslint-config/index.js";

/** @type {import("eslint").Linter.Config} */
export default {
  ...config,
  ignorePatterns: ["apps/**", "packages/**"],
};
