// Barre d'actions en bas de l'écran de jeu :
// « Valider » confirme la salle de départ, la fin des déplacements, puis la salle à fermer ;
// « Annuler » retire le dernier déplacement (ou revient aux déplacements).
import * as game from "../state/game";
import { Icon } from "./Icon";

export function ActionBar() {
  return (
    <nav class="action-bar" aria-label="Actions">
      <button id="undoBtn" disabled={!game.canUndo.value} onClick={game.undo}>
        <Icon name="undo" /> Annuler
      </button>
      <button class="big" id="closeBtn" disabled={!game.canValidate.value} onClick={game.validate}>
        <Icon name="check" /> VALIDER
      </button>
    </nav>
  );
}
