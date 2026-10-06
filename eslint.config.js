import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const strudelOnlyInEngine = {
  group: ["@strudel/*", "superdough"],
  message: "Strudel n'est importé que depuis src/engine/.",
};

const noFrameworkInPureLayers = [
  strudelOnlyInEngine,
  { group: ["react", "react-dom", "react/*"], message: "Couche pure : pas de React." },
  { group: ["zustand", "zustand/*"], message: "Couche pure : pas de Zustand." },
  { group: ["dexie"], message: "Couche pure : pas de Dexie." },
  {
    group: ["@/store/*", "@/ui/*", "@/engine/*", "@/storage/*"],
    message: "Couche pure : sens des dépendances.",
  },
];

const noDeepRelative = { group: ["../../*"], message: "Utiliser l'alias @/." };

export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "no-console": "error",
      "no-restricted-imports": ["error", { patterns: [strudelOnlyInEngine, noDeepRelative] }],
      "no-restricted-syntax": [
        "error",
        { selector: "ExportDefaultDeclaration", message: "Exports nommés uniquement." },
      ],
    },
  },
  {
    files: ["src/model/**", "src/codegen/**", "src/lib/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [...noFrameworkInPureLayers, noDeepRelative] },
      ],
    },
  },
  {
    files: ["src/engine/**"],
    rules: { "no-restricted-imports": ["error", { patterns: [noDeepRelative] }] },
  },
  {
    files: ["src/**/*.test.ts", "src/test/**"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
  {
    files: ["*.config.{js,ts}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
    rules: { "no-restricted-syntax": "off" },
  },
);
