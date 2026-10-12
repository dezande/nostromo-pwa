import { render } from "preact";
import "./styles/main.scss";
import "./state/settings.js"; // applique le style d'écran et lance la musique dès l'ouverture
import { App } from "./App.jsx";
import { audio } from "./audio/audio.js";
import { registerServiceWorker } from "./state/pwa.js";

render(<App />, document.getElementById("app"));
registerServiceWorker();

// Accès depuis la console du navigateur et pour les tests automatiques.
window.nostromo = { audio };
