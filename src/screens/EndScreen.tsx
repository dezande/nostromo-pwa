// Fin de partie : agent survivant ou éliminé.
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { ending, startGame } from "../state/game";
import { returnHome } from "../state/ui";

export function EndScreen() {
  const end = ending.value;
  return (
    <Overlay id="end" show={!!end}>
      <div class={`panel end ${end?.win ? "win" : "dead"}`} id="endPanel">
        <h2 id="endTitle">{end ? (end.win ? "AGENT SURVIVANT" : "AGENT ÉLIMINÉ") : ""}</h2>
        <p id="endText">{end?.text}</p>
        <div class="row icon-row">
          <IconButton id="endMenuBtn" icon="accueil" label="Accueil" onClick={() => { ending.value = null; returnHome(); }} />
          <IconButton id="againBtn" icon="demarrer" label="Rejouer" primary onClick={startGame} />
        </div>
      </div>
    </Overlay>
  );
}
