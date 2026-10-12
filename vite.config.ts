import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa";

// Numéro de build : nombre de commits Git + identifiant court du commit.
// Il change donc tout seul à chaque commit, sans rien modifier à la main.
const git = (cmd: string): string => { try { return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } };
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const build = {
  version: pkg.version,
  number: git("git rev-list --count HEAD") || "dev",
  commit: git("git rev-parse --short HEAD"),
  date: new Date().toISOString().slice(0, 10),
};

export default defineConfig({
  // Sur GitHub Pages, le site est servi sous /<nom-du-dépôt>/ (voir .github/workflows/pages.yml).
  base: process.env.BASE_PATH || "/",
  define: { __BUILD__: JSON.stringify(build) },
  plugins: [
    preact(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        name: "Nostromo II – Training Base",
        short_name: "Nostromo II",
        description: "Plan du vaisseau-base, fermeture des salles, compte à rebours et ambiance sonore.",
        lang: "fr",
        display: "standalone",
        orientation: "any",
        background_color: "#07090a",
        theme_color: "#07090a",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Les polices des styles d'écran viennent de Google Fonts : on les garde aussi pour le hors ligne.
        runtimeCaching: [{
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
          handler: "CacheFirst",
          options: { cacheName: "polices", expiration: { maxEntries: 30 }, cacheableResponse: { statuses: [0, 200] } },
        }],
      },
    }),
  ],
});
