// Écran d'accueil. On y revient par les Réglages (« Retour à l'accueil »), ce qui abandonne la partie.
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { audio } from "../audio/audio";
import { BOOT } from "../data/terminal";
import { keepAwake } from "../state/device";
import { showIntro } from "../state/game";
import { runTerminal, terminalOpen } from "../state/terminal";
import { briefing, homeOpen, settingsOpen } from "../state/ui";
import { settings } from "../state/settings";
import { SCENARIOS } from "../data/scenarios";
import { contractSigned } from "./Recruitment";

async function startSimulation() {
  if (terminalOpen.value) return;
  audio.init();
  keepAwake();
  await runTerminal(BOOT);
  homeOpen.value = false;
  showIntro();
  contractSigned.value = false;
  briefing.value = settings.scenario.value === "recruitment" ? "hr" : "welcome";
}

export function Home() {
  return (
    <Overlay id="home" show={homeOpen.value}>
      <div class="home">
        <Rocket />
        <div class="corp">WEYLAND-YUTANI CORP</div>
        <h2>NOSTROMO&nbsp;II</h2>
        <div class="base">TRAINING BASE · LUNE</div>
        <p id="homeLine">{SCENARIOS[settings.scenario.value].homeLine}</p>
        <div class="row icon-row home-actions">
          <IconButton id="startBtn" icon="demarrer" label="Démarrer" primary onClick={startSimulation} />
          <IconButton id="homeSetBtn" icon="reglages" label="Réglages" onClick={() => { settingsOpen.value = true; }} />
        </div>
        <div class="blink">ACCÈS AUTORISÉ · NIVEAU 5</div>
      </div>
    </Overlay>
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
