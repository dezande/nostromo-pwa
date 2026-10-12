// Panneau du coordinateur : état de la partie, fermeture, annulation et fiche A.I.P.
import { ROOMS, stepLabel } from "../data/ship.js";
import { STEP_COUNT } from "../data/protocols.js";
import * as game from "../state/game.js";
import { Icon } from "./Icon.jsx";
import { useConfirm } from "./useConfirm.js";

export function Coordinator() {
  const phase = game.phase.value;
  const busy = game.busy.value;
  const [confirmReset, runReset] = useConfirm();

  return (
    <aside class="coordinator">
      <div class="card">
        <h3>COORDINATEUR</h3>
        <div class="status" id="status"><Status /></div>
        <div class="counter">
          <span>Déplacements <b id="moves">{game.moves.value}</b></span>
          <span>Fermeture <b id="step">{game.step.value}/{STEP_COUNT}</b></span>
        </div>
      </div>

      <button class="big" id="closeBtn" disabled={phase !== "move" || busy} onClick={game.closeRooms}>
        <Icon name="warn" /> FERMETURE DE SALLE
      </button>

      <div class="row">
        <button id="undoBtn" disabled={phase !== "move" || !game.trail.value.length || busy} onClick={game.undo}>
          <Icon name="undo" /> Annuler
        </button>
        <button id="resetBtn" onClick={() => !busy && runReset(phase === "move", game.newGame)}>
          <Icon name="reset" /> <span id="resetLbl">{confirmReset ? "Confirmer ?" : "Nouvelle partie"}</span>
        </button>
      </div>

      <ProtocolSheet />
    </aside>
  );
}

function Status() {
  switch (game.phase.value) {
    case "place": return <>Le Psychic Agent pose son pion : <b>touchez la salle de départ</b>.</>;
    case "move": return <>Agent en <b>{ROOMS[game.position.value].name}</b>. Déplacez-le selon la carte W.Y.C., puis lancez la fermeture.</>;
    case "dead": return <>Agent éliminé.</>;
    case "win": return <>Entraînement terminé. <b>Agent survivant.</b></>;
    default: return <>Choisissez un protocole.</>;
  }
}

/** Fiche A.I.P. : ordre de fermeture, caché sauf pour les étapes passées (ou si « Afficher »). */
function ProtocolSheet() {
  const proto = game.protocol.value;
  const peek = game.peek.value;
  const step = game.step.value;
  return (
    <div class="card">
      <h3>
        FICHE A.I.P. <span id="protoName">{proto ? `N°${proto.id}` : ""}</span>
        <button class="mini" id="peekBtn" aria-pressed={String(peek)} onClick={() => { game.peek.value = !peek; }}>
          {peek ? "Masquer" : "Afficher"}
        </button>
      </h3>
      <ol class="aip" id="aip">
        {proto?.steps.map((rooms, i) => {
          const hidden = !peek && i >= step;
          const state = i < step ? "done" : i === step && peek ? "next" : "";
          return (
            <li key={i} class={state}>
              <i>{i + 1}</i><span>{hidden ? "▒▒▒▒▒▒▒▒" : stepLabel(rooms)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
