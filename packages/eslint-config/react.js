// packages/eslint-config/react.js
import base from "./base.js";
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
// import tailwind from "eslint-plugin-tailwindcss"; // TailwindCSS v4互換性問題のため一時的に無効化

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...base,
  ...compat.extends(
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    // "plugin:tailwindcss/recommended" // TailwindCSS v4互換性問題のため一時的に無効化
  ),
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      // tailwind // TailwindCSS v4互換性問題のため一時的に無効化
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: {
      react: { version: "detect" },
      // tailwindcss: { // TailwindCSS v4互換性問題のため一時的に無効化
      //   callees: ["clsx", "ctl"],
      //   config: "tailwind.config.ts"
      // }
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "jsx-a11y/no-autofocus": "off",
      "@typescript-eslint/no-explicit-any": "warn", // any型の使用を警告に変更
      "@typescript-eslint/no-unused-vars": "warn", // 未使用変数を警告に変更
      "unused-imports/no-unused-vars": "warn", // 未使用インポートを警告に変更
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // any型の使用を警告に変更
      "@typescript-eslint/no-unused-vars": "warn", // 未使用変数を警告に変更
    },
  },
];
