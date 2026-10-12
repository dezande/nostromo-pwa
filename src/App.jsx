import { Header } from "./components/Header.jsx";
import { ShipMap } from "./components/ShipMap.jsx";
import { Coordinator } from "./components/Coordinator.jsx";
import { PressStart } from "./screens/PressStart.jsx";
import { Home } from "./screens/Home.jsx";
import { ProtocolPicker } from "./screens/ProtocolPicker.jsx";
import { Countdown } from "./screens/Countdown.jsx";
import { EndScreen } from "./screens/EndScreen.jsx";
import { Settings } from "./screens/Settings.jsx";
import { Transition } from "./screens/Transition.jsx";
import { shake } from "./state/game.js";

export function App() {
  return (
    <>
      {/* Effets d'écran cathodique (halo, bruit, scintillement…) par-dessus tout. */}
      <div id="crt" aria-hidden="true" />

      <Header />
      <main id="main" class={shake.value ? "shake" : ""}>
        <ShipMap />
        <Coordinator />
      </main>

      {/* Écrans superposés, du plus bas au plus haut. */}
      <ProtocolPicker />
      <Countdown />
      <EndScreen />
      <Home />
      <Settings />
      <PressStart />
      <Transition />
    </>
  );
}
