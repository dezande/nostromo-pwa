// Tests unitaires (Jest) : données, logique de jeu, réglages, composants.
// Les tests de bout en bout dans le navigateur sont dans tests/ (Playwright).

/** @type {import("jest").Config} */
export default {
  testEnvironment: "jsdom",
  // Version CommonJS de @preact/signals (jsdom choisirait sinon sa version ESM « browser »).
  testEnvironmentOptions: { customExportConditions: ["node", "require", "default"] },
  // Preact 11 n'existe plus qu'en ESM (.mjs) : ses fichiers passent aussi par @swc/jest (→ CommonJS).
  transformIgnorePatterns: ["/node_modules/(?!preact/)"],
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  transform: {
    "^.+\\.(t|j)sx?$|\\.mjs$": ["@swc/jest", {
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
  moduleNameMapper: {
    // Les feuilles de style (ex. police du logo) ne servent à rien dans les tests.
    "\\.css$": "<rootDir>/src/test/styleStub.cjs",
    // jsdom ne connaît pas Web Audio : le module audio est remplacé par un faux (src/test/audioMock.ts) partout.
    "(^|/)audio/audio$": "<rootDir>/src/test/audioMock.ts",
  },
  // Langue de l'app : français par défaut dans les tests.
  setupFiles: ["<rootDir>/src/test/setup.ts"],
  clearMocks: true,
  // Couverture (npm run test:coverage) : le fournisseur v8 lit les sourcemaps de @swc/jest, Babel ne le peut pas.
  // Mesurée sur le code de l'app seulement : ni les tests ni leurs aides, ni le point d'entrée (main.tsx).
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/test/**",
    "!src/**/*.test.{ts,tsx}",
    "!src/env.d.ts",
    "!src/main.tsx",
  ],
  coverageReporters: ["text-summary", "text", "html", "lcov"],
};
