import { Header } from "./components/Header";
import { ShipMap } from "./components/ShipMap";
import { ActionBar } from "./components/ActionBar";
import { PressStart } from "./screens/PressStart";
import { Home } from "./screens/Home";
import { Briefing } from "./screens/Briefing";
import { Countdown } from "./screens/Countdown";
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
      <main id="main" class={shake.value ? "shake" : ""}>
        <ShipMap />
      </main>
      <ActionBar />

      {/* Écrans superposés, du plus bas au plus haut. */}
      <Briefing />
      <Countdown />
      <EndScreen />
      <Home />
      <Settings />
      <PressStart />
      <Transition />
    </>
  );
}
