// Panneaux affichés après « Démarrer la simulation » : bienvenue, puis explication du protocole.
// Les textes dépendent du scénario choisi dans les Réglages (src/data/scenarios.ts).
// Pas de choix de protocole dans l'app : le Coordinateur utilise ses fiches papier.
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { WeylandLogo } from "../components/WeylandLogo";
import { RuleScene } from "../components/RuleScenes";
import { SCENARIOS } from "../data/scenarios";
import { settings } from "../state/settings";
import { startGame } from "../state/game";
import { briefing, type BriefingPanel } from "../state/ui";

export function Briefing() {
  const panel = briefing.value;
  const text = SCENARIOS[settings.scenario.value];
  const RULES = text.rules;
  // Retour depuis la première règle : bienvenue (entraînement) ou contrat (recrutement).
  const first: BriefingPanel = settings.scenario.value === "recruitment" ? "contract" : "welcome";
  return (
    <>
      <Overlay id="welcome" show={panel === "welcome"} class="briefing">
        <div class="panel briefing-panel welcome-panel">
          <WeylandLogo class="logo-watermark logo-in-panel" />
          <div class="briefing-corp">WEYLAND-YUTANI CORP · BASE LUNAIRE D'ENTRAÎNEMENT NOSTROMO II</div>
          <div class="briefing-motto">« Building Better Worlds »</div>
          <h2>BIENVENUE À BORD, AGENT.</h2>
          <p>Vous avez été sélectionné pour rejoindre le programme Psychic Agents de la Weyland-Yutani Corporation. Votre future mission : ressentir la présence de créatures xénomorphes infiltrées à bord de nos vaisseaux de colonisation.</p>
          <p>Le vaisseau-base Nostromo II reproduit un cargo de taille moyenne de la compagnie. L'entraînement se déroule en conditions réelles. Huit spécimens adultes sont confinés sous le plancher du vaisseau.</p>
          <p>Votre contrat prévoit les risques liés à cet entraînement. La compagnie vous remercie de votre engagement.</p>
          <div class="row icon-row briefing-actions">
            <IconButton id="welcomeNext" icon="continuer" label="Continuer" primary onClick={() => { briefing.value = 1; }} />
          </div>
        </div>
      </Overlay>

      {/* Une règle par panneau, pour tenir dans l'écran sans défilement */}
      {RULES.map((rule, i) => (
        <Overlay key={rule.id} id={`rule${i + 1}`} show={panel === i + 1} class="briefing">
          <div class="panel briefing-panel rule-panel">
            <div class="briefing-corp">
              {text.rulesHeader} · RÈGLE <span class="rule-count">{i + 1}/{RULES.length}</span>
            </div>
            {i === 0 && <p class="briefing-intro">{text.rulesIntro}</p>}
            <h3 class="rule-title">{rule.title}</h3>
            {/* La scène ne tourne que quand son panneau est affiché */}
            {panel === i + 1 && <RuleScene name={rule.scene} />}
            <p class="rule-text">{rule.text}</p>
            {i === RULES.length - 1 && <p class="briefing-sign">{text.rulesSign}</p>}
            <div class="row icon-row briefing-actions">
              <IconButton id={`rule${i + 1}Back`} icon="retour" label="Retour"
                onClick={() => { briefing.value = i === 0 ? first : (i as BriefingPanel); }} />
              <IconButton id={`rule${i + 1}Next`} icon="continuer" label="Continuer" primary
                onClick={() => { if (i === RULES.length - 1) { briefing.value = null; startGame(); } else briefing.value = (i + 2) as BriefingPanel; }} />
            </div>
          </div>
        </Overlay>
      ))}
    </>
  );
}
