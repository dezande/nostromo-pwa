import { render } from "preact";
import "./styles/main.scss";
import "./state/settings"; // applique le style d'écran et lance la musique dès l'ouverture
import { App } from "./App";
import { audio } from "./audio/audio";
import { registerServiceWorker } from "./state/pwa";

render(<App />, document.getElementById("app")!);
registerServiceWorker();

// Accès depuis la console du navigateur et pour les tests automatiques.
window.nostromo = { audio };
