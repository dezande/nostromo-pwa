// Écran titre « touchez l'écran pour commencer » : le navigateur exige un geste avant de jouer du son.
import { useEffect } from "preact/hooks";
import { Overlay } from "../components/Overlay.jsx";
import { audio } from "../audio/audio.js";
import { keepAwake } from "../state/device.js";
import { settings } from "../state/settings.js";
import { pressToStart } from "../state/ui.js";

function start() {
  audio.init();
  keepAwake();
  pressToStart.value = false;
}

export function PressStart() {
  useEffect(() => {
    // Si la musique est activée mais que le son est bloqué, on demande un premier contact.
    const timer = setTimeout(() => {
      if (settings.music.value && audio.state !== "running") pressToStart.value = true;
    }, 300);
    const onKey = e => { if (pressToStart.value) { e.preventDefault(); start(); } };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <Overlay id="press" show={pressToStart.value} role="button" tabIndex={0} aria-label="Commencer" onPointerDown={start}>
      <div class="blink">▶ TOUCHEZ L'ÉCRAN POUR COMMENCER</div>
    </Overlay>
  );
}
