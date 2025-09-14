import react from "@cheering/eslint-config/react";

/** @type {import("eslint").Linter.Config} */
export default [
  ...react,
  {
    ignores: [
      "dist/**/*",
      "ios/**/*",
      "android/**/*",
      "node_modules/**/*",
      "*.config.js",
      "*.config.ts",
      "vitest.setup.ts",
    ],
  },
];
