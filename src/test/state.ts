// Remise à zéro de l'état global (signaux) entre les tests qui le modifient : langue, écrans, partie.
import { batch } from "@preact/signals";
import { lang } from "../i18n";
import { showIntro } from "../state/game";
import { briefing, choosingScenario, homeOpen, openDocument, quitAsking, settingsOpen, sourcesOpen, tutorial } from "../state/ui";

/** L'app comme à l'ouverture : accueil en français, aucun écran posé par-dessus, pas de partie en cours. */
export function resetState() {
  batch(() => {
    lang.value = "fr";
    homeOpen.value = true;
    choosingScenario.value = false;
    settingsOpen.value = false;
    quitAsking.value = false;
    briefing.value = null;
    tutorial.value = null;
    sourcesOpen.value = false;
    openDocument.value = null;
    showIntro();
  });
}
