import { Header } from "./components/Header";
import { ShipMap } from "./components/ShipMap";
import { Coordinator } from "./components/Coordinator";
import { PressStart } from "./screens/PressStart";
import { Home } from "./screens/Home";
import { ProtocolPicker } from "./screens/ProtocolPicker";
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
