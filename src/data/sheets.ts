// Documents des scénarios (3D6 Système) : fiches prétirées, aide et guide du Superviseur, cartes des petits rôles.
// Chacun se lit dans l'app (page HTML du dossier fiches/) ou se télécharge en PDF (public/fiches).
import type { IconName } from "../components/Icon";
import type { Scenario } from "../state/settings";
import type { ScenarioDocument } from "../state/ui";
import { lang, tr } from "../i18n";

/** Sorte de document : son nom (complet, pour la liseuse et les lecteurs d'écran), le texte court et l'icône du bouton. */
export type SheetKind = "male" | "female" | "aid" | "guide" | "roles";
const SHEET_NAMES = (): Record<SheetKind, { name: string; label: string; icon: IconName }> => ({
  male: { name: tr("Prétiré homme", "Pre-gen (male)"), label: tr("Prétiré", "Pre-gen"), icon: "homme" },
  female: { name: tr("Prétiré femme", "Pre-gen (female)"), label: tr("Prétiré", "Pre-gen"), icon: "femme" },
  aid: { name: tr("Aide du Superviseur", "Supervisor aid"), label: tr("Aide", "Aid"), icon: "aide" },
  guide: { name: tr("Guide du Superviseur", "Supervisor guide"), label: tr("Guide", "Guide"), icon: "guide" },
  roles: { name: tr("Cartes des petits rôles", "Minor role cards"), label: tr("Rôles", "Roles"), icon: "roles" },
});

/**
 * Un document : page HTML lue dans l'app (dossier fiches/) et PDF à imprimer (public/fiches),
 * en français, avec leur version anglaise dans `en`.
 */
type Sheet = Omit<ScenarioDocument, "name"> & { id: string; kind: SheetKind; en: { html: string; file: string } };

/** Document dans la langue de l'app, avec son nom et le texte court de son bouton. */
export type LocalizedSheet = ScenarioDocument & { id: string; label: string; icon: IconName };
export const localized = ({ kind, en, ...sheet }: Sheet): LocalizedSheet =>
  ({ ...sheet, ...(lang.value === "en" ? en : {}), ...SHEET_NAMES()[kind] });

/** Documents de chaque scénario. */
export const SHEETS: Record<Scenario, Sheet[]> = {
  training: [
    { id: "trainingPdf", kind: "male", html: "psychic-agent.html", pages: ".page.joueur", file: "nostromo-fiche-psychic-agent-homme.pdf",
      en: { html: "psychic-agent-en.html", file: "nostromo-sheet-psychic-agent-male.pdf" } },
    { id: "trainingFemPdf", kind: "female", html: "psychic-agent.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-psychic-agent-femme.pdf",
      en: { html: "psychic-agent-en.html", file: "nostromo-sheet-psychic-agent-female.pdf" } },
    { id: "trainingMjPdf", kind: "aid", html: "psychic-agent.html", pages: ".page:not(.joueur)", file: "nostromo-aide-superviseur-entrainement.pdf",
      en: { html: "psychic-agent-en.html", file: "nostromo-supervisor-aid-training.pdf" } },
    { id: "trainingGuidePdf", kind: "guide", html: "guide-superviseur-entrainement.html", file: "nostromo-guide-superviseur-entrainement.pdf",
      en: { html: "guide-superviseur-entrainement-en.html", file: "nostromo-supervisor-guide-training.pdf" } },
  ],
  recruitment: [
    { id: "sheetsPdf", kind: "male", html: "fiches.html", pages: ".page.joueur", file: "nostromo-fiche-reyes-homme.pdf",
      en: { html: "fiches-en.html", file: "nostromo-sheet-reyes-male.pdf" } },
    { id: "sheetsFemPdf", kind: "female", html: "fiches.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-reyes-femme.pdf",
      en: { html: "fiches-en.html", file: "nostromo-sheet-reyes-female.pdf" } },
    { id: "sheetsMjPdf", kind: "aid", html: "fiches.html", pages: ".page:not(.joueur)", file: "nostromo-aide-superviseur-recrutement.pdf",
      en: { html: "fiches-en.html", file: "nostromo-supervisor-aid-recruitment.pdf" } },
    { id: "guidePdf", kind: "guide", html: "guide-superviseur.html", file: "nostromo-guide-superviseur-recrutement.pdf",
      en: { html: "guide-superviseur-en.html", file: "nostromo-supervisor-guide-recruitment.pdf" } },
  ],
  infiltrated: [
    { id: "infiltratedPdf", kind: "male", html: "infiltre.html", pages: ".page.joueur", file: "nostromo-fiche-lieutenant-dr-homme.pdf",
      en: { html: "infiltre-en.html", file: "nostromo-sheet-lieutenant-dr-male.pdf" } },
    { id: "infiltratedFemPdf", kind: "female", html: "infiltre.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-lieutenant-dr-femme.pdf",
      en: { html: "infiltre-en.html", file: "nostromo-sheet-lieutenant-dr-female.pdf" } },
    { id: "infiltratedMjPdf", kind: "aid", html: "infiltre.html", pages: ".page:not(.joueur)", file: "nostromo-aide-superviseur-infiltre.pdf",
      en: { html: "infiltre-en.html", file: "nostromo-supervisor-aid-infiltrated.pdf" } },
    { id: "infiltratedGuidePdf", kind: "guide", html: "guide-superviseur-infiltre.html", file: "nostromo-guide-superviseur-infiltre.pdf",
      en: { html: "guide-superviseur-infiltre-en.html", file: "nostromo-supervisor-guide-infiltrated.pdf" } },
  ],
  free: [],
};

/** Cartes des petits rôles des spectateurs (IA, Xénomorphes) : les mêmes pour tous les scénarios (pas sans scénario). */
export const ROLES: Sheet = { id: "rolesPdf", kind: "roles", html: "roles.html", file: "nostromo-cartes-roles.pdf",
  en: { html: "roles-en.html", file: "nostromo-role-cards.pdf" } };

/** Document d'après son identifiant (adresse /scenario/document/…), dans la langue de l'app. */
export function findSheet(id: string): LocalizedSheet | null {
  const sheet = [...Object.values(SHEETS).flat(), ROLES].find(s => s.id === id);
  return sheet ? localized(sheet) : null;
}
