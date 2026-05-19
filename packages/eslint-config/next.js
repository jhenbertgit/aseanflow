import { config as baseConfig } from "./index.js";
import nextPlugin from "@next/eslint-plugin-next";

export const nextJsConfig = [
  ...baseConfig,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "off",
    },
  },
];
