import { config as baseConfig } from "./index.js";

export const nextJsConfig = [
  ...baseConfig,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "off",
    },
  },
];
