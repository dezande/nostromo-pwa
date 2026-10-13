import { Header } from "./components/Header";
import { WeylandLogo } from "./components/WeylandLogo";
import { ShipMap } from "./components/ShipMap";
import { ActionBar } from "./components/ActionBar";
import { PressStart } from "./screens/PressStart";
import { Home } from "./screens/Home";
import { Briefing } from "./screens/Briefing";
import { EndScreen } from "./screens/EndScreen";
import { Settings } from "./screens/Settings";
import { Transition } from "./screens/Transition";
import { shake } from "./state/game";

export function App() {
  return (
    <>
      {/* Effets d'écran cathodique (halo, bruit, scintillement…) par-dessus tout. */}
      <div id="crt" aria-hidden="true" />

      <Header />
      {/* Logo Weyland Corp en filigrane, très discret, derrière le plan */}
      <WeylandLogo class="logo-watermark logo-faint" />
      <main id="main" class={shake.value ? "shake" : ""}>
        <ShipMap />
      </main>
      <ActionBar />

      {/* Écrans superposés, du plus bas au plus haut. */}
      <Briefing />
      <EndScreen />
      <Home />
      <Settings />
      <PressStart />
      <Transition />
    </>
  );
}
