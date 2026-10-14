// Tests unitaires (Jest) : données, logique de jeu, réglages, composants.
// Les tests de bout en bout dans le navigateur sont dans tests/ (Playwright).

/** @type {import("jest").Config} */
export default {
  testEnvironment: "jsdom",
  // Versions CommonJS de preact et @preact/signals (jsdom choisirait sinon leurs versions ESM).
  testEnvironmentOptions: { customExportConditions: ["node", "require", "default"] },
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", {
      jsc: {
        parser: { syntax: "typescript", tsx: true },
        transform: { react: { runtime: "automatic", importSource: "preact" } },
      },
      module: { type: "commonjs" },
    }],
  },
  globals: {
    __BUILD__: { version: "0.0.0", number: "test", commit: "", date: "2026-01-01" },
  },
  // Les feuilles de style (ex. police du logo) ne servent à rien dans les tests.
  moduleNameMapper: { "\\.css$": "<rootDir>/src/test/styleStub.cjs" },
  // Langue de l'app : français par défaut dans les tests.
  setupFiles: ["<rootDir>/src/test/setup.ts"],
  clearMocks: true,
};
