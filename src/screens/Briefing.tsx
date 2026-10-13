// Panneaux affichés après « Démarrer la simulation » : bienvenue, puis explication du protocole.
// Pas de choix de protocole dans l'app : le Coordinateur utilise ses fiches papier.
import { Overlay } from "../components/Overlay";
import { Icon } from "../components/Icon";
import { RuleScene, type RuleName } from "../components/RuleScenes";
import { startGame } from "../state/game";
import { briefing, type BriefingPanel } from "../state/ui";

const RULES: { id: string; title: string; scene: RuleName; text: string }[] = [
  {
    id: "start", title: "POSITION DE DÉPART", scene: "start",
    text: "Choisissez la salle où vous commencez l'entraînement. Vous pouvez changer d'avis tant que vous n'avez pas validé.",
  },
  {
    id: "moves", title: "DÉPLACEMENTS", scene: "moves",
    text: "Avant chaque fermeture, le Coordinateur tire une carte W.Y.C. Elle indique le nombre de déplacements imposés. Un déplacement vous fait passer dans une salle voisine, par une porte, un ascenseur ou un passage de ventilation. Les ascenseurs et les conduits d'aération sont des lieux de passage : vous ne pouvez pas vous y arrêter.",
  },
  {
    id: "close", title: "FERMETURE", scene: "close",
    text: "Le Coordinateur annonce la salle fermée. Un xénomorphe y est introduit. Tout agent présent dans cette salle est éliminé.",
  },
  {
    id: "end", title: "FIN DE L'ENTRAÎNEMENT", scene: "end",
    text: "Huit fermetures se succèdent. Seuls les agents qui se trouvent dans la dernière salle restée ouverte survivent.",
  },
];

export function Briefing() {
  const panel = briefing.value;
  return (
    <>
      <Overlay id="welcome" show={panel === "welcome"} class="briefing">
        <div class="panel briefing-panel">
          <div class="briefing-corp">WEYLAND-YUTANI CORP · BASE LUNAIRE D'ENTRAÎNEMENT NOSTROMO II</div>
          <div class="briefing-motto">« Building Better Worlds »</div>
          <h2>BIENVENUE À BORD, AGENT.</h2>
          <p>Vous avez été sélectionné pour rejoindre le programme Psychic Agents de la Weyland-Yutani Corporation. Votre future mission : ressentir la présence de créatures xénomorphes infiltrées à bord de nos vaisseaux de colonisation.</p>
          <p>Le vaisseau-base Nostromo II reproduit un cargo de taille moyenne de la compagnie. L'entraînement se déroule en conditions réelles. Huit spécimens adultes sont confinés sous le plancher du vaisseau.</p>
          <p>Votre contrat prévoit les risques liés à cet entraînement. La compagnie vous remercie de votre engagement.</p>
          <div class="row briefing-actions">
            <button class="big" id="welcomeNext" onClick={() => { briefing.value = 1; }}>
              CONTINUER <Icon name="play" />
            </button>
          </div>
        </div>
      </Overlay>

      {/* Une règle par panneau, pour tenir dans l'écran sans défilement */}
      {RULES.map((rule, i) => (
        <Overlay key={rule.id} id={`rule${i + 1}`} show={panel === i + 1} class="briefing">
          <div class="panel briefing-panel rule-panel">
            <div class="briefing-corp">
              ALIEN INTRUSION PROTOCOL · RÈGLE <span class="rule-count">{i + 1}/{RULES.length}</span>
            </div>
            {i === 0 && <p class="briefing-intro">Le protocole de cet entraînement a été établi par la compagnie. Seul le Coordinateur en connaît l'ordre de fermeture.</p>}
            <h3 class="rule-title">{rule.title}</h3>
            {/* La scène ne tourne que quand son panneau est affiché */}
            {panel === i + 1 && <RuleScene name={rule.scene} />}
            <p class="rule-text">{rule.text}</p>
            {i === RULES.length - 1 && <p class="briefing-sign">Fiez-vous à votre instinct, Agent.</p>}
            <div class="row briefing-actions">
              <button id={`rule${i + 1}Back`} onClick={() => { briefing.value = i === 0 ? "welcome" : (i as BriefingPanel); }}>← RETOUR</button>
              <button class="big" id={`rule${i + 1}Next`}
                onClick={() => { if (i === RULES.length - 1) { briefing.value = null; startGame(); } else briefing.value = (i + 2) as BriefingPanel; }}>
                CONTINUER <Icon name="play" />
              </button>
            </div>
          </div>
        </Overlay>
      ))}
    </>
  );
}
