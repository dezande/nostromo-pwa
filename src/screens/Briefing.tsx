// Panneaux affichés après « Démarrer la simulation » : bienvenue, puis explication du protocole.
// Pas de choix de protocole dans l'app : le Coordinateur utilise ses fiches papier.
import { Overlay } from "../components/Overlay";
import { Icon } from "../components/Icon";
import { startGame } from "../state/game";
import { briefing } from "../state/ui";

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
            <button class="big" id="welcomeNext" onClick={() => { briefing.value = "protocol"; }}>
              CONTINUER <Icon name="play" />
            </button>
          </div>
        </div>
      </Overlay>

      <Overlay id="briefing" show={panel === "protocol"} class="briefing">
        <div class="panel briefing-panel">
          <div class="briefing-corp">ALIEN INTRUSION PROTOCOL · INSTRUCTIONS</div>
          <p class="briefing-intro">Le protocole de cet entraînement a été établi par la compagnie. Seul le Coordinateur en connaît l'ordre de fermeture.</p>
          <ol class="briefing-steps">
            <li>
              <h3>POSITION DE DÉPART</h3>
              <p>Choisissez la salle où vous commencez l'entraînement. Vous pouvez changer d'avis tant que vous n'avez pas validé.</p>
            </li>
            <li>
              <h3>DÉPLACEMENTS</h3>
              <p>Avant chaque fermeture, le Coordinateur tire une carte W.Y.C. Elle indique le nombre de déplacements imposés. Un déplacement vous fait passer dans une salle voisine, par une porte, un ascenseur ou un passage de ventilation. Les ascenseurs et les conduits d'aération sont des lieux de passage : vous ne pouvez pas vous y arrêter.</p>
            </li>
            <li>
              <h3>FERMETURE</h3>
              <p>Le Coordinateur annonce la salle fermée. Un xénomorphe y est introduit. Tout agent présent dans cette salle est éliminé.</p>
            </li>
            <li>
              <h3>FIN DE L'ENTRAÎNEMENT</h3>
              <p>Huit fermetures se succèdent. Seuls les agents qui se trouvent dans la dernière salle restée ouverte survivent.</p>
            </li>
          </ol>
          <p class="briefing-sign">Fiez-vous à votre instinct, Agent.</p>
          <div class="row briefing-actions">
            <button id="briefingBack" onClick={() => { briefing.value = "welcome"; }}>← RETOUR</button>
            <button class="big" id="briefingNext" onClick={() => { briefing.value = null; startGame(); }}>
              CONTINUER <Icon name="play" />
            </button>
          </div>
        </div>
      </Overlay>
    </>
  );
}
