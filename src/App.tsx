import { Header } from "./components/Header";
import { WeylandLogo } from "./components/WeylandLogo";
import { ShipMap } from "./components/ShipMap";
import { ActionBar } from "./components/ActionBar";
import { PressStart } from "./screens/PressStart";
import { Home } from "./screens/Home";
import { Briefing } from "./screens/Briefing";
import { Recruitment } from "./screens/Recruitment";
import { EndScreen } from "./screens/EndScreen";
import { Settings } from "./screens/Settings";
import { Transition } from "./screens/Transition";
import { shake } from "./state/game";

export function App() {
  return (
    <>
      {/* Effets d'écran cathodique (halo, bruit, scintillement…) par-dessus tout. */}
      <div id="crt" aria-hidden="true" />

      {/* Écran de jeu : tient exactement dans la fenêtre, sans défilement (format tablette ou téléphone). */}
      <div class="game-screen" id="game">
        <Header />
        <main id="main" class={shake.value ? "shake" : ""}>
          <ShipMap />
        </main>
        <ActionBar />
      </div>
      {/* Logo Weyland Corp en filigrane, très discret, par-dessus le plan mais transparent aux clics */}
      <WeylandLogo class="logo-watermark logo-faint" />

      {/* Écrans superposés, du plus bas au plus haut. */}
      <Briefing />
      <Recruitment />
      <EndScreen />
      <Home />
      <Settings />
      <PressStart />
      <Transition />
    </>
  );
}
