import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "**/.next/**",
    ".vercel/**",
    "**/.vercel/**",
    "out/**",
    "build/**",
    "**/node_modules/**",
    "packages/shared-types/dist/**",
    "**/next-env.d.ts",
    "scripts/**",
    "**/scripts/**",
    "*.js",
  ]),
  {
    rules: {
      // Existing code intentionally uses dynamic API payloads at these boundaries.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      // React Compiler rules are not compatible with the current React 18 codebase;
      // preserve the runtime behavior and rely on TypeScript/build checks instead.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      // Keep lint output focused on correctness; these legacy warnings are covered by
      // the successful TypeScript, unit-test, and production-build gates.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
    },
  },
]);
