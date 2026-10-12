// Compte à rebours avant la fermeture d'une salle.
import { Overlay } from "../components/Overlay.jsx";
import { countdown } from "../state/game.js";

export function Countdown() {
  const c = countdown.value;
  return (
    <Overlay id="count" show={!!c} aria-live="assertive">
      <div>
        <div class="lbl">FERMETURE IMMINENTE</div>
        <div class="num" id="countNum">{c ? c.n : ""}</div>
        <div class="room-name" id="countRoom">{c ? c.room : ""}</div>
      </div>
    </Overlay>
  );
}
