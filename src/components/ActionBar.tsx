// Barre d'actions en bas de l'écran de jeu :
// « Valider » confirme la salle de départ, la fin des déplacements, puis la salle à fermer ;
// « Annuler » retire le dernier déplacement (ou revient aux déplacements).
import * as game from "../state/game";
import { Icon } from "./Icon";
import { expired, formatTime, remaining } from "../state/timer";

export function ActionBar() {
  return (
    <nav class="action-bar" aria-label="Actions">
      <button id="undoBtn" disabled={!game.canUndo.value} onClick={game.undo}>
        <Icon name="undo" /> Annuler
      </button>
      <TrainingTimer />
      <button class="big" id="closeBtn" disabled={!game.canValidate.value} onClick={game.validate}>
        <Icon name="check" /> VALIDER
      </button>
    </nav>
  );
}

/** Temps restant de l'entraînement (5 minutes) ; rouge dans la dernière minute. */
function TrainingTimer() {
  const left = remaining.value;
  if (left === null) return null;
  const state = expired.value ? "expired" : left <= 60 ? "urgent" : "";
  return (
    <div class={`training-timer ${state}`} id="trainingTimer" role="timer" aria-label="Temps restant">
      {formatTime(left)}
    </div>
  );
}
