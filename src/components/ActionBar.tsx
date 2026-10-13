// Barre d'actions en bas de l'écran de jeu :
// « Valider » confirme la salle de départ, la fin des déplacements, puis la salle à fermer ;
// « Pas arrière » retire le dernier déplacement (ou revient aux déplacements).
import * as game from "../state/game";
import { IconButton } from "./Icon";

export function ActionBar() {
  return (
    <nav class="action-bar" aria-label="Actions">
      <IconButton id="undoBtn" icon="pasArriere" label="Pas arrière" disabled={!game.canUndo.value} onClick={game.undo} />
      <IconButton id="closeBtn" icon="valider" label="Valider" primary disabled={!game.canValidate.value} onClick={game.validate} />
    </nav>
  );
}
