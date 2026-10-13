// Fin de partie : rapport de la compagnie, dans le style du panneau de bienvenue.
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { WeylandLogo } from "../components/WeylandLogo";
import { ending, startGame } from "../state/game";
import { returnHome } from "../state/ui";

export function EndScreen() {
  const end = ending.value;
  return (
    <Overlay id="end" show={!!end} class="briefing">
      <div class={`panel briefing-panel welcome-panel end ${end?.win ? "win" : "dead"}`} id="endPanel">
        <WeylandLogo class="logo-watermark logo-in-panel" />
        <div class="briefing-corp">
          WEYLAND-YUTANI CORP · {end?.win ? "RAPPORT D'ENTRAÎNEMENT" : "RAPPORT D'INCIDENT"} · NOSTROMO II
        </div>
        <div class="briefing-motto">« Building Better Worlds »</div>
        <h2 id="endTitle">{end ? (end.win ? "AGENT SURVIVANT" : "AGENT ÉLIMINÉ") : ""}</h2>
        {end && (end.win ? (
          <>
            <p id="endText" class="end-status">ENTRAÎNEMENT TERMINÉ.</p>
            <p>Félicitations, Agent. Vous avez survécu à toutes les fermetures du protocole.</p>
            <p>Position finale : <span class="end-room">{end.room.toUpperCase()}</span>. Vos capacités de Psychic Agent sont confirmées : vous avez ressenti chaque présence xénomorphe à bord du vaisseau-base.</p>
            <p>La compagnie vous remercie de votre engagement. Votre dossier est transmis pour une première mission.</p>
          </>
        ) : (
          <>
            <p id="endText">Fermeture de la salle : <span class="end-room">{end.room.toUpperCase()}</span>. Un spécimen y a été introduit. Vous vous y trouviez.</p>
            <p>Conformément à votre contrat, les risques liés à cet entraînement étaient connus et acceptés.</p>
            <p>La compagnie regrette la perte de son agent. Un nouveau candidat va être sélectionné.</p>
          </>
        ))}
        <div class="row icon-row briefing-actions">
          <IconButton id="endMenuBtn" icon="accueil" label="Accueil" onClick={() => { ending.value = null; returnHome(); }} />
          <IconButton id="againBtn" icon="demarrer" label="Rejouer" primary onClick={startGame} />
        </div>
      </div>
    </Overlay>
  );
}
