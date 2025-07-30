import path from "node:path";
import { fileURLToPath } from "node:url";
import prettierPlugin from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
   baseDirectory: import.meta.dirname
});

export default [
   js.configs.recommended,
   ...compat.extends("plugin:@next/next/recommended"),

   {
      files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
      languageOptions: {
         ecmaVersion: "latest",
         sourceType: "module",
         parser: tsParser,
         parserOptions: {
            project: path.join(__dirname, "tsconfig.json"),
            tsconfigRootDir: __dirname
         },
         globals: {
            ...globals.node,
            ...globals.browser,
            React: "readonly",
            AsyncLocalStorage: "readonly"
         }
      },
      plugins: {
         "@typescript-eslint": tsPlugin,
         prettier: prettierPlugin,
         "react-hooks": reactHooks,
         react
      },
      rules: {
         ...reactHooks.configs["recommended-latest"].rules,
         ...react.configs.flat.recommended?.rules,
         "@typescript-eslint/no-unsafe-call": "off",
         "@typescript-eslint/no-unsafe-member-access": "off",
         "@typescript-eslint/no-unsafe-assignment": "off",
         "no-unused-vars": "off",
         "@typescript-eslint/no-misused-promises": ["warn", { checksVoidReturn: false }],
         "@typescript-eslint/no-unused-vars": [
            "warn",
            {
               argsIgnorePattern: "^_",
               varsIgnorePattern: "^_",
               caughtErrorsIgnorePattern: "^_"
            }
         ],
         "@typescript-eslint/no-non-null-assertion": "off",
         "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
         "react-hooks/exhaustive-deps": "off",
         "object-curly-spacing": ["error", "always"],
         "@typescript-eslint/no-explicit-any": "warn",
         "@typescript-eslint/no-unnecessary-type-assertion": "warn",
         quotes: ["error", "double"],
         "prettier/prettier": ["warn"],
         "@typescript-eslint/no-floating-promises": "warn",
         "react/react-in-jsx-scope": "off"
      },
      settings: {
         react: {
            version: "detect"
         }
      }
   }
];
