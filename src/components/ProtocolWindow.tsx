// Fenêtre du protocole (au-dessus du pont 2) : guide le Psychic Agent, façon terminal.
import { room } from "../data/ship";
import { phase, position, startRoom } from "../state/game";
import { InfoPanel } from "./InfoPanel";
import { useTypewriter } from "./useTypewriter";

/** Message affiché selon l'étape de la partie (les étapes suivantes viendront plus tard). */
export function protocolMessage(): string {
  if (phase.value === "place") {
    if (!position.value) return "AGENT, CHOISISSEZ VOTRE SALLE DE DÉPART";
    return `SALLE DE DÉPART : ${room(position.value).name.toUpperCase()} — VALIDEZ OU CHOISISSEZ UNE AUTRE SALLE`;
  }
  if (startRoom.value) return `POSITION ENREGISTRÉE : ${room(startRoom.value).name.toUpperCase()}`;
  return "";
}

export function ProtocolWindow() {
  const message = protocolMessage();
  const typed = useTypewriter(message);
  return (
    <InfoPanel title="PROTOCOLE A.I.P.">
      {message ? (
        <p class="terminal-text" id="protocolMessage">
          <span class={typed.length < message.length ? "cur" : ""}>{typed}</span>
        </p>
      ) : undefined}
    </InfoPanel>
  );
}
