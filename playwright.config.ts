// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:4173",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    // En local on utilise le Chrome installé ; en CI, le Chromium de Playwright.
    ...(process.env.CI ? {} : { channel: "chrome" }),
  },
  projects: [
    { name: "ordinateur", use: { viewport: { width: 1200, height: 800 } } },
    { name: "telephone", use: { ...devices["Pixel 7"], ...(process.env.CI ? {} : { channel: "chrome" }) } },
  ],
  webServer: {
    // Les tests tournent sur la version compilée, comme sur GitHub Pages.
    command: "npx vite build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "ignore",
  },
});
