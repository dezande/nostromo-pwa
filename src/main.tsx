import { render } from "preact";
import "./styles/main.scss";
import "./i18n"; // en premier : la langue du premier lancement se décide avant que les réglages soient enregistrés
import "./state/viewport"; // hauteur visible de la fenêtre, pour les navigateurs sans 100dvh
import "./state/settings"; // applique le style d'écran et lance la musique dès l'ouverture
import "./state/alert"; // musique d'alerte et voix pendant les 5 minutes
import { App } from "./App";
import { audio } from "./audio/audio";
import { registerServiceWorker } from "./state/pwa";

render(<App />, document.getElementById("app")!);
registerServiceWorker();

// Accès depuis la console du navigateur et pour les tests automatiques (qui ont pu y poser des réglages avant le chargement).
window.nostromo = { ...window.nostromo, audio };
