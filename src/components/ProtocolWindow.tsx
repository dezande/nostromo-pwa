// Fenêtre du protocole (au-dessus du pont 2) : guide le Psychic Agent, façon terminal.
import { roomName } from "../data/ship";
import { moves, phase, position, toClose } from "../state/game";
import { stepLabel } from "../data/ship";
import { InfoPanel } from "./InfoPanel";
import { useTypewriter } from "./useTypewriter";
import { tr } from "../i18n";

/** Message affiché selon l'étape de la partie. */
function protocolMessage(): string {
  if (phase.value === "place") {
    if (!position.value) return tr("AGENT, CHOISISSEZ VOTRE SALLE DE DÉPART", "AGENT, CHOOSE YOUR STARTING ROOM");
    const name = roomName(position.value).toUpperCase();
    return tr(`SALLE DE DÉPART : ${name} — VALIDEZ OU CHOISISSEZ UNE AUTRE SALLE`, `STARTING ROOM: ${name} — CONFIRM OR CHOOSE ANOTHER ROOM`);
  }
  if (phase.value === "close") {
    if (!toClose.value.size) return tr("COORDINATEUR : TOUCHEZ LA SALLE À FERMER", "COORDINATOR: TOUCH THE ROOM TO SEAL");
    const rooms = stepLabel([...toClose.value]).toUpperCase();
    return tr(`SALLE À FERMER : ${rooms} — VALIDEZ POUR LANCER LA FERMETURE`, `ROOM TO SEAL: ${rooms} — CONFIRM TO START SEALING`);
  }
  if (phase.value === "move" && position.value) {
    if (moves.value === 0) return tr("POSITION ENREGISTRÉE : ", "POSITION RECORDED: ") + roomName(position.value).toUpperCase();
    // Pas de compteur visible : seulement l'étape en cours.
    return tr("DÉPLACEMENTS EN COURS", "MOVES IN PROGRESS");
  }
  return "";
}

export function ProtocolWindow() {
  const message = protocolMessage();
  const typed = useTypewriter(message);
  return (
    <InfoPanel title={tr("PROTOCOLE A.I.P.", "A.I.P. PROTOCOL")}>
      {message ? (
        <p class="terminal-text" id="protocolMessage">
          <span class={typed.length < message.length ? "cur" : ""}>{typed}</span>
        </p>
      ) : undefined}
    </InfoPanel>
  );
}
