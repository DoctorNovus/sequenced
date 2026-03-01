import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import query from "@tanstack/eslint-plugin-query";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores([
        "dist",
        "dist/**",
        "android/**",
        "**/android/**",
        "ios/**",
        "**/ios/**",
        "resources/**",
        "**/resources/**",
        "public/assets/**",
        "**/public/assets/**",
        "**/node_modules/**"
    ]),
    {
        files: ["**/*.{ts,js,tsx,jsx}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
            query.configs["flat/recommended"]
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
            "@typescript-eslint/no-wrapper-object-types": "off",
            "prefer-const": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/immutability": "off",
            "react-hooks/purity": "off",
            "react-hooks/rules-of-hooks": "off",
            "react-hooks/exhaustive-deps": "off",
            "react-refresh/only-export-components": "off",
            "no-undef": "off"
        }
    },
]);
