// Barre d'actions en bas de l'écran de jeu :
// « Valider » confirme la salle de départ, la fin des déplacements, puis la salle à fermer ;
// « Pas arrière » retire le dernier déplacement (ou revient aux déplacements).
import * as game from "../state/game";
import { IconButton } from "./Icon";
import { tr } from "../i18n";

export function ActionBar() {
  return (
    <nav class="action-bar" aria-label={tr("Actions", "Actions")}>
      <IconButton id="undoBtn" icon="pasArriere" label={tr("Pas arrière", "Step back")} disabled={!game.canUndo.value} onClick={game.undo} />
      <IconButton id="closeBtn" icon="valider" label={tr("Valider", "Confirm")} primary disabled={!game.canValidate.value} onClick={game.validate} />
    </nav>
  );
}
