// Panneaux affichés après « Démarrer la simulation » : bienvenue, puis explication du protocole.
// Les textes dépendent du scénario choisi au lancement (src/data/scenarios.ts).
// Pas de choix de protocole dans l'app : le Coordinateur utilise ses fiches papier.
// Chaque panneau est un moniteur mural de la salle de briefing, que l'instructeur fait défiler.
import { useEffect } from "preact/hooks";
import { Overlay } from "../components/Overlay";
import { Monitor, briefingRoom } from "../components/Monitor";
import { audio } from "../audio/audio";
import { IconButton } from "../components/Icon";
import { WeylandLogo } from "../components/WeylandLogo";
import { RuleScene } from "../components/RuleScenes";
import { Redact } from "../components/Redacted";
import { scenarioText } from "../data/scenarios";
import { settings } from "../state/settings";
import { DOC_REFS } from "../data/documents";
import { startGame } from "../state/game";
import { briefing, type BriefingPanel } from "../state/ui";
import { lang, tr } from "../i18n";

export function Briefing() {
  const panel = briefing.value;
  const text = scenarioText(settings.scenario.value);
  const RULES = text.rules;
  // Retour depuis la première règle : dernier panneau d'introduction du scénario.
  const first = text.lastPanel;
  // Petit bruit de commutation à chaque changement d'écran (si le son est actif)
  useEffect(() => { if (panel !== null) audio.tick(); }, [panel]);
  return (
    <>
      <Overlay id="welcome" show={panel === "welcome"} class="briefing">
        <Monitor label={`${tr("MONITEUR", "MONITOR")} 00 · ${briefingRoom()}`}>
        <div class="panel briefing-panel welcome-panel">
          <WeylandLogo class="logo-watermark logo-in-panel" />
          <div class="briefing-corp">WEYLAND-YUTANI CORP · {tr("BASE LUNAIRE D'ENTRAÎNEMENT NOSTROMO II", "NOSTROMO II LUNAR TRAINING BASE")}</div>
          <div class="doc-ref" id="welcomeRef">{DOC_REFS.welcome}</div>
          <div class="briefing-motto">« Building Better Worlds »</div>
          {lang.value === "en" ? (
            <>
              <h2>WELCOME ABOARD, AGENTS.</h2>
              {/* Une convocation : la session valide la candidature, sans un mot sur ce qui attend les agents */}
              <p>You have been selected for the Weyland-Yutani Corporation's Psychic Agents program. Your future mission: to sense the presence of xenomorph creatures hidden aboard our colony ships.</p>
              <p>Before any assignment, a training session validates each application. You are expected on stardate 2122.06.03 at 08:00, briefing room B-7, Nostromo II lunar base.</p>
              <p>Bring your agent file. The company thanks you for your commitment.</p>
            </>
          ) : (
            <>
              <h2>BIENVENUE À BORD, AGENTS.</h2>
              {/* Une convocation : la session valide la candidature, sans un mot sur ce qui attend les agents */}
              <p>Vous avez été retenus pour le programme Psychic Agents de la Weyland-Yutani Corporation. Votre future mission : ressentir la présence de créatures xénomorphes infiltrées à bord de nos vaisseaux de colonisation.</p>
              <p>Avant toute affectation, une session d'entraînement valide chaque candidature. Vous êtes attendus à la date stellaire 2122.06.03, 08:00, salle de briefing B-7, base lunaire Nostromo II.</p>
              <p>Munissez-vous de votre dossier d'agent. La compagnie vous remercie de votre engagement.</p>
            </>
          )}
          <div class="row icon-row briefing-actions">
            <IconButton id="welcomeNext" icon="continuer" label={tr("Continuer", "Continue")} primary onClick={() => { briefing.value = 1; }} />
          </div>
        </div>
        </Monitor>
      </Overlay>

      {/* Une règle par panneau, pour tenir dans l'écran sans défilement */}
      {RULES.map((rule, i) => (
        <Overlay key={rule.id} id={`rule${i + 1}`} show={panel === i + 1} class="briefing">
          <Monitor label={`${tr("MONITEUR", "MONITOR")} 0${i + 1}/0${RULES.length} · ${briefingRoom()}`} status={tr("QUESTIONS : NON AUTORISÉES", "QUESTIONS: NOT AUTHORIZED")}>
          <div class="panel briefing-panel rule-panel">
            <div class="briefing-corp">
              {text.rulesHeader} · {tr("RÈGLE", "RULE")} <span class="rule-count">{i + 1}/{RULES.length}</span>
            </div>
            <div class="doc-ref">{DOC_REFS.rule(i + 1)}</div>
            {i === 0 && <p class="briefing-intro"><Redact text={text.rulesIntro} /></p>}
            <h3 class="rule-title">{rule.title}</h3>
            {/* La scène ne tourne que quand son panneau est affiché */}
            {panel === i + 1 && <RuleScene name={rule.scene} />}
            <ul class="rule-points">
              {rule.points.map(point => <li key={point}><Redact text={point} /></li>)}
            </ul>
            {i === RULES.length - 1 && <p class="briefing-sign">{text.rulesSign}</p>}
            <div class="row icon-row briefing-actions">
              <IconButton id={`rule${i + 1}Back`} icon="retour" label={tr("Retour", "Back")}
                onClick={() => { briefing.value = i === 0 ? first : (i as BriefingPanel); }} />
              <IconButton id={`rule${i + 1}Next`} icon="continuer" label={tr("Continuer", "Continue")} primary
                onClick={() => { if (i === RULES.length - 1) { briefing.value = null; startGame(); } else briefing.value = (i + 2) as BriefingPanel; }} />
            </div>
          </div>
          </Monitor>
        </Overlay>
      ))}
    </>
  );
}
