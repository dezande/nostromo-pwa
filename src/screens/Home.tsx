// Écran d'accueil. On y revient par les Réglages (« Retour à l'accueil »), ce qui abandonne la partie.
// « Démarrer » affiche le choix du scénario, puis « Lancer » démarre la simulation.
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { audio } from "../audio/audio";
import { BOOT } from "../data/terminal";
import { keepAwake } from "../state/device";
import { showIntro } from "../state/game";
import { runTerminal, terminalOpen } from "../state/terminal";
import { briefing, choosingScenario, homeOpen, openDocument, settingsOpen, tutorial, type ScenarioDocument } from "../state/ui";
import { settings, type Scenario } from "../state/settings";
import { SCENARIOS } from "../data/scenarios";
import { contractSigned } from "./Recruitment";

async function startSimulation() {
  if (terminalOpen.value) return;
  audio.init();
  keepAwake();
  await runTerminal(BOOT);
  homeOpen.value = false;
  choosingScenario.value = false;
  showIntro();
  contractSigned.value = false;
  briefing.value = SCENARIOS[settings.scenario.value].firstPanel;
}

export function Home() {
  return (
    <Overlay id="home" show={homeOpen.value}>
      {choosingScenario.value ? <ScenarioChoice /> : (
        <div class="home">
          <Rocket />
          <div class="corp">WEYLAND-YUTANI CORP</div>
          <h2>NOSTROMO&nbsp;II</h2>
          <div class="base">TRAINING BASE · LUNE</div>
          <div class="row icon-row home-actions">
            <IconButton id="startBtn" icon="demarrer" label="Démarrer" primary onClick={() => { choosingScenario.value = true; }} />
            <IconButton id="homeSetBtn" icon="reglages" label="Réglages" onClick={() => { settingsOpen.value = true; }} />
            <IconButton id="tutoBtn" icon="tuto" label="Tutoriel 3D6 Système" onClick={() => { tutorial.value = 0; }} />
          </div>
          <div class="blink">ACCÈS AUTORISÉ · NIVEAU 5</div>
        </div>
      )}
    </Overlay>
  );
}

/** Documents de chaque scénario : page HTML lue dans l'app (dossier fiches/) et PDF à imprimer (public/fiches). */
/** label : texte court du bouton (name, complet, sert à la liseuse et aux lecteurs d'écran). */
const SHEETS: Record<Scenario, (ScenarioDocument & { id: string; label: string })[]> = {
  training: [
    { id: "trainingPdf", html: "psychic-agent.html", pages: ".page.joueur", file: "nostromo-fiche-psychic-agent-homme.pdf", name: "Prétiré homme", label: "Prétiré H" },
    { id: "trainingFemPdf", html: "psychic-agent.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-psychic-agent-femme.pdf", name: "Prétiré femme", label: "Prétiré F" },
    { id: "trainingMjPdf", html: "psychic-agent.html", pages: ".page:not(.joueur)", file: "nostromo-aide-mj-entrainement.pdf", name: "Aide du MJ", label: "Aide MJ" },
    { id: "trainingGuidePdf", html: "guide-mj-entrainement.html", file: "nostromo-guide-mj-entrainement.pdf", name: "Guide du MJ", label: "Guide MJ" },
  ],
  recruitment: [
    { id: "sheetsPdf", html: "fiches.html", pages: ".page.joueur", file: "nostromo-fiche-jordan-reyes-homme.pdf", name: "Prétiré homme", label: "Prétiré H" },
    { id: "sheetsFemPdf", html: "fiches.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-jordan-reyes-femme.pdf", name: "Prétiré femme", label: "Prétiré F" },
    { id: "sheetsMjPdf", html: "fiches.html", pages: ".page:not(.joueur)", file: "nostromo-aide-mj-recrutement.pdf", name: "Aide du MJ", label: "Aide MJ" },
    { id: "guidePdf", html: "guide-mj.html", file: "nostromo-guide-mj-recrutement.pdf", name: "Guide du MJ", label: "Guide MJ" },
  ],
  infiltrated: [
    { id: "infiltratedPdf", html: "infiltre.html", pages: ".page.joueur", file: "nostromo-fiche-lieutenant-dr-homme.pdf", name: "Prétiré homme", label: "Prétiré H" },
    { id: "infiltratedFemPdf", html: "infiltre.html", pages: ".page.joueur", feminine: true, file: "nostromo-fiche-lieutenant-dr-femme.pdf", name: "Prétiré femme", label: "Prétiré F" },
    { id: "infiltratedMjPdf", html: "infiltre.html", pages: ".page:not(.joueur)", file: "nostromo-aide-mj-infiltre.pdf", name: "Aide du MJ", label: "Aide MJ" },
    { id: "infiltratedGuidePdf", html: "guide-mj-infiltre.html", file: "nostromo-guide-mj-infiltre.pdf", name: "Guide du MJ", label: "Guide MJ" },
  ],
};

/** Choix du scénario au lancement ; le dernier choisi est proposé par défaut. */
function ScenarioChoice() {
  const current = settings.scenario.value;
  return (
    <div class="home scenario-choice">
      <h2 id="scenarioTitle">SCÉNARIO</h2>
      <div class="alert-cards scenario-cards" role="radiogroup" aria-labelledby="scenarioTitle">
        {(Object.keys(SCENARIOS) as Scenario[]).map(id => (
          <button key={id} class="alert-card" id={`scenario-${id}`} role="radio" aria-checked={current === id}
            onClick={() => { settings.scenario.value = id; }}>
            <strong>{SCENARIOS[id].name}</strong>
            <small>{SCENARIOS[id].homeLine}</small>
          </button>
        ))}
      </div>
      <p id="scenarioDesc">{SCENARIOS[current].description}</p>
      <div class="sheets" id="sheets">
        <span class="set-label">Documents (3D6 Système)</span>
        <div class="sheet-links">
          {SHEETS[current].map(({ id, label, ...sheet }) => (
            <span key={id} class="sheet">
              <button type="button" class="sheet-link" id={`${id}Read`} aria-label={`Lire : ${sheet.name}`} onClick={() => { openDocument.value = sheet; }}>
                {label}
              </button>
              <a class="sheet-link sheet-pdf" id={id} href={`fiches/${sheet.file}`} target="_blank" rel="noopener"
                download={sheet.file /* nom du fichier téléchargé (sans valeur, Preact écrirait download="true") */}
                aria-label={`${sheet.name} en PDF`}>
                PDF
              </a>
            </span>
          ))}
        </div>
      </div>
      <div class="row icon-row home-actions">
        <IconButton id="scenarioBack" icon="retour" label="Retour" onClick={() => { choosingScenario.value = false; }} />
        <IconButton id="launchBtn" icon="demarrer" label="Lancer" primary onClick={startSimulation} />
      </div>
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
