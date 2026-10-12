// Barre d'actions en bas de l'écran de jeu : valider (salle de départ, puis fermetures) et annuler.
// (Le panneau complet du coordinateur reviendra plus tard sous une autre forme.)
import * as game from "../state/game";
import { Icon } from "./Icon";

export function ActionBar() {
  const busy = game.busy.value;
  const moving = game.phase.value === "move";
  return (
    <nav class="action-bar" aria-label="Actions">
      <button id="undoBtn" disabled={!moving || !game.trail.value.length || busy} onClick={game.undo}>
        <Icon name="undo" /> Annuler
      </button>
      <button class="big" id="closeBtn" disabled={!game.canValidate.value} onClick={game.validate}>
        <Icon name="check" /> VALIDER
      </button>
    </nav>
  );
}
