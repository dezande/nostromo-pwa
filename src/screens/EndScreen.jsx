// Fin de partie : agent survivant ou éliminé.
import { Overlay } from "../components/Overlay.jsx";
import { Icon } from "../components/Icon.jsx";
import { ending, newGame } from "../state/game.js";
import { openMenu } from "../state/ui.js";

export function EndScreen() {
  const end = ending.value;
  return (
    <Overlay id="end" show={!!end}>
      <div class={`panel end ${end?.win ? "win" : "dead"}`} id="endPanel">
        <h2 id="endTitle">{end ? (end.win ? "AGENT SURVIVANT" : "AGENT ÉLIMINÉ") : ""}</h2>
        <p id="endText">{end?.text}</p>
        <div class="row">
          <button id="endMenuBtn" onClick={() => { ending.value = null; openMenu(); }}><Icon name="menu" /> Menu</button>
          <button id="againBtn" onClick={newGame}><Icon name="reset" /> Rejouer</button>
        </div>
      </div>
    </Overlay>
  );
}
