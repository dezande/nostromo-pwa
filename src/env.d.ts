// Infos de build injectées par vite.config.ts (define).
declare const __BUILD__: {
  version: string;
  number: string;
  commit: string;
  date: string;
};

interface Window {
  webkitAudioContext?: typeof AudioContext;
  /** Accès depuis la console et pour les tests automatiques. */
  nostromo?: { audio: typeof import("./audio/audio").audio };
}
