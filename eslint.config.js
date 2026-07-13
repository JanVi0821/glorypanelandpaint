import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      "@stylistic": stylistic,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".astro/**"],
  },
);
