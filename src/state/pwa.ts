// Mode hors ligne (service worker généré par vite-plugin-pwa) et numéro de build.
import { signal } from "@preact/signals";

export type OfflineState = "installing" | "ready" | "update" | "unsupported";
export const offline = signal<OfflineState>("serviceWorker" in navigator ? "installing" : "unsupported");

/** Infos de build injectées par vite.config.js. */
export const BUILD = __BUILD__;

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) {
    // Pas de mode hors ligne en développement : on retire un éventuel ancien service worker.
    for (const registration of await navigator.serviceWorker.getRegistrations()) await registration.unregister();
    return;
  }
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({
    immediate: true,
    onOfflineReady: () => { offline.value = "ready"; },
    onNeedRefresh: () => { offline.value = "update"; },
    onRegisteredSW: (_url, registration) => {
      if (registration?.active && navigator.serviceWorker.controller) offline.value = "ready";
    },
  });
}
