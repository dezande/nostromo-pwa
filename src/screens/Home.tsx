// Écran d'accueil. On y revient par les Réglages (« Retour à l'accueil »), ce qui abandonne la partie.
// « Démarrer » affiche le choix du scénario, puis « Lancer » démarre la simulation.
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { audio } from "../audio/audio";
import { BOOT, BOOT_EN } from "../data/terminal";
import { keepAwake } from "../state/device";
import { showIntro } from "../state/game";
import { runTerminal, terminalOpen } from "../state/terminal";
import { briefing, choosingScenario, homeOpen, openDocument, settingsOpen, sourcesOpen, tutorial, type ScenarioDocument } from "../state/ui";
import { settings, type Scenario } from "../state/settings";
import { SCENARIO_IDS, scenarioText } from "../data/scenarios";
import { LANGS, byLang, lang, tr } from "../i18n";
import { contractSigned } from "./Recruitment";

async function startSimulation() {
  if (terminalOpen.value) return;
  audio.init();
  keepAwake();
  await runTerminal(byLang({ fr: BOOT, en: BOOT_EN }));
  homeOpen.value = false;
  choosingScenario.value = false;
  showIntro();
  contractSigned.value = false;
  briefing.value = scenarioText(settings.scenario.value).firstPanel;
}

export function Home() {
  return (
    <Overlay id="home" show={homeOpen.value}>
      {choosingScenario.value ? <ScenarioChoice /> : (
        <div class="home">
          <Rocket />
          <div class="corp">WEYLAND-YUTANI CORP</div>
          <h2>NOSTROMO&nbsp;II</h2>
          <div class="base">TRAINING BASE · {tr("LUNE", "MOON")}</div>
          <div class="row icon-row home-actions">
            <IconButton id="startBtn" icon="demarrer" label={tr("Démarrer", "Start")} primary onClick={() => { choosingScenario.value = true; }} />
            <IconButton id="homeSetBtn" icon="reglages" label={tr("Réglages", "Settings")} onClick={() => { settingsOpen.value = true; }} />
            <IconButton id="tutoBtn" icon="tuto" label={tr("Tutoriel 3D6 Système", "3D6 Système tutorial")} onClick={() => { tutorial.value = 0; }} />
            <IconButton id="sourcesBtn" icon="sources" label={tr("Sources et crédits", "Sources and credits")} onClick={() => { sourcesOpen.value = true; }} />
          </div>
          <LangSwitch />
          <div class="blink">{tr("ACCÈS AUTORISÉ · NIVEAU 5", "ACCESS GRANTED · LEVEL 5")}</div>
        </div>
      )}
    </Overlay>
  );
}

/** Sorte de document : son nom (complet, pour la liseuse et les lecteurs d'écran) et le texte court du bouton. */
type SheetKind = "male" | "female" | "aid" | "guide" | "roles";
const SHEET_NAMES = (): Record<SheetKind, { name: string; label: string }> => ({
  male: { name: tr("Prétiré homme", "Pre-gen (male)"), label: tr("Prétiré H", "Pre-gen M") },
  female: { name: tr("Prétiré femme", "Pre-gen (female)"), label: tr("Prétiré F", "Pre-gen F") },
  aid: { name: tr("Aide du MJ", "GM aid"), label: tr("Aide MJ", "GM aid") },
  guide: { name: tr("Guide du MJ", "GM guide"), label: tr("Guide MJ", "GM guide") },
  roles: { name: tr("Cartes des petits rôles", "Minor role cards"), label: tr("Rôles", "Roles") },
});

/**
 * Un document : page HTML lue dans l'app (dossier fiches/) et PDF à imprimer (public/fiches),
 * en français, avec leur version anglaise dans `en`.
 */
type Sheet = Omit<ScenarioDocument, "name"> & { id: string; kind: SheetKind; en: { html: string; file: string } };

/** Document dans la langue de l'app, avec son nom et le texte court de son bouton. */
const localized = ({ kind, en, ...sheet }: Sheet): ScenarioDocument & { id: string; label: string } =>
  ({ ...sheet, ...(lang.value === "en" ? en : {}), ...SHEET_NAMES()[kind] });

/** Documents de chaque scénario. */
const SHEETS: Record<Scenario, Sheet[]> = {
  training: [
    { id: "trainingPdf", kind: "male", html: "psychic-agent.html", pages: ".page.joueur", file: "nostromo-fiche-psychic-agent-homme.pdf",
      en: { html: "psychic-agent-en.html", file: "nostromo-sheet-psychic-agent-male.pdf" } },
    { id: "trainingFemPdf", kind: "female", html: "psychic-agent.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-psychic-agent-femme.pdf",
      en: { html: "psychic-agent-en.html", file: "nostromo-sheet-psychic-agent-female.pdf" } },
    { id: "trainingMjPdf", kind: "aid", html: "psychic-agent.html", pages: ".page:not(.joueur)", file: "nostromo-aide-mj-entrainement.pdf",
      en: { html: "psychic-agent-en.html", file: "nostromo-gm-aid-training.pdf" } },
    { id: "trainingGuidePdf", kind: "guide", html: "guide-mj-entrainement.html", file: "nostromo-guide-mj-entrainement.pdf",
      en: { html: "guide-mj-entrainement-en.html", file: "nostromo-gm-guide-training.pdf" } },
  ],
  recruitment: [
    { id: "sheetsPdf", kind: "male", html: "fiches.html", pages: ".page.joueur", file: "nostromo-fiche-reyes-homme.pdf",
      en: { html: "fiches-en.html", file: "nostromo-sheet-reyes-male.pdf" } },
    { id: "sheetsFemPdf", kind: "female", html: "fiches.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-reyes-femme.pdf",
      en: { html: "fiches-en.html", file: "nostromo-sheet-reyes-female.pdf" } },
    { id: "sheetsMjPdf", kind: "aid", html: "fiches.html", pages: ".page:not(.joueur)", file: "nostromo-aide-mj-recrutement.pdf",
      en: { html: "fiches-en.html", file: "nostromo-gm-aid-recruitment.pdf" } },
    { id: "guidePdf", kind: "guide", html: "guide-mj.html", file: "nostromo-guide-mj-recrutement.pdf",
      en: { html: "guide-mj-en.html", file: "nostromo-gm-guide-recruitment.pdf" } },
  ],
  infiltrated: [
    { id: "infiltratedPdf", kind: "male", html: "infiltre.html", pages: ".page.joueur", file: "nostromo-fiche-lieutenant-dr-homme.pdf",
      en: { html: "infiltre-en.html", file: "nostromo-sheet-lieutenant-dr-male.pdf" } },
    { id: "infiltratedFemPdf", kind: "female", html: "infiltre.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-lieutenant-dr-femme.pdf",
      en: { html: "infiltre-en.html", file: "nostromo-sheet-lieutenant-dr-female.pdf" } },
    { id: "infiltratedMjPdf", kind: "aid", html: "infiltre.html", pages: ".page:not(.joueur)", file: "nostromo-aide-mj-infiltre.pdf",
      en: { html: "infiltre-en.html", file: "nostromo-gm-aid-infiltrated.pdf" } },
    { id: "infiltratedGuidePdf", kind: "guide", html: "guide-mj-infiltre.html", file: "nostromo-guide-mj-infiltre.pdf",
      en: { html: "guide-mj-infiltre-en.html", file: "nostromo-gm-guide-infiltrated.pdf" } },
  ],
};

/** Cartes des petits rôles des spectateurs (IA, Xénomorphes) : les mêmes pour tous les scénarios. */
const ROLES: Sheet = { id: "rolesPdf", kind: "roles", html: "roles.html", file: "nostromo-cartes-roles.pdf",
  en: { html: "roles-en.html", file: "nostromo-role-cards.pdf" } };

/** Un document : « lire dans l'app » (bouton court) et son PDF. */
function SheetLink({ id, label, ...sheet }: ScenarioDocument & { id: string; label: string }) {
  return (
    <span class="sheet">
      <button type="button" class="sheet-link" id={`${id}Read`} aria-label={tr(`Lire : ${sheet.name}`, `Read: ${sheet.name}`)} onClick={() => { openDocument.value = sheet; }}>
        {label}
      </button>
      <a class="sheet-link sheet-pdf" id={id} href={`fiches/${sheet.file}`} target="_blank" rel="noopener"
        download={sheet.file /* nom du fichier téléchargé (sans valeur, Preact écrirait download="true") */}
        aria-label={tr(`${sheet.name} en PDF`, `${sheet.name} as PDF`)}>
        PDF
      </a>
    </span>
  );
}

/** Choix du scénario au lancement ; le dernier choisi est proposé par défaut. */
function ScenarioChoice() {
  const current = settings.scenario.value;
  return (
    <div class="home scenario-choice">
      <h2 id="scenarioTitle">{tr("SCÉNARIO", "SCENARIO")}</h2>
      <div class="alert-cards scenario-cards" role="radiogroup" aria-labelledby="scenarioTitle">
        {SCENARIO_IDS.map(id => (
          <button key={id} class="alert-card" id={`scenario-${id}`} role="radio" aria-checked={current === id}
            onClick={() => { settings.scenario.value = id; }}>
            <span class="scenario-head">
              <strong>{scenarioText(id).name}</strong>
              <small class="scenario-meta" title={tr("Niveau du joueur et durée indicative", "Player level and approximate duration")}>{scenarioText(id).level} · {scenarioText(id).duration}</small>
            </span>
            <small class="scenario-line">{scenarioText(id).homeLine}</small>
          </button>
        ))}
      </div>
      {/* Toutes les descriptions empilées, une seule visible : la hauteur suit la plus longue et rien ne bouge au changement de scénario */}
      <div class="scenario-desc">
        {SCENARIO_IDS.map(id => id === current
          ? <p key={id} id="scenarioDesc">{scenarioText(id).description}</p>
          : <p key={id} class="hidden-desc" aria-hidden="true">{scenarioText(id).description}</p>)}
      </div>
      <div class="sheets" id="sheets">
        {/* Les cartes des rôles sur la ligne du titre : l'écran tient encore sur un petit téléphone */}
        <div class="sheets-head">
          <span class="set-label">Documents (3D6 Système)</span>
          <SheetLink {...localized(ROLES)} />
        </div>
        <div class="sheet-links">
          {SHEETS[current].map(sheet => <SheetLink key={sheet.id} {...localized(sheet)} />)}
        </div>
      </div>
      <div class="row icon-row home-actions">
        <IconButton id="scenarioBack" icon="retour" label={tr("Retour", "Back")} onClick={() => { choosingScenario.value = false; }} />
        <IconButton id="launchBtn" icon="demarrer" label={tr("Lancer", "Launch")} primary onClick={startSimulation} />
      </div>
    </div>
  );
}

/** Choix de la langue, à l'accueil : FR · EN. */
function LangSwitch() {
  return (
    <div class="lang-switch" role="radiogroup" aria-label="Langue / Language">
      {LANGS.map(l => (
        <button key={l} type="button" id={`lang-${l}`} role="radio" aria-checked={lang.value === l}
          lang={l} aria-label={l === "fr" ? "Français" : "English"} onClick={() => { lang.value = l; }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Rocket() {
  return (
    <svg class="rocket" viewBox="0 0 120 160" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
      <line x1="60" y1="4" x2="60" y2="18" />
      <path d="M48 50 L60 18 L72 50 Z" />
      <rect x="48" y="50" width="24" height="80" />
      <rect x="32" y="66" width="16" height="56" />
      <rect x="72" y="66" width="16" height="56" />
      <path d="M20 84 L32 76 L32 122 L20 122 Z" />
      <path d="M100 84 L88 76 L88 122 L100 122 Z" />
      <path d="M50 130 L46 146 L58 146 L56 130" />
      <path d="M70 130 L74 146 L62 146 L64 130" />
      <rect x="55" y="118" width="10" height="8" fill="#ff3b3b" stroke="#ff3b3b" />
    </svg>
  );
}
