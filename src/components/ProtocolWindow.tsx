// Fenêtre du protocole (au-dessus du pont 2) : guide le Psychic Agent, façon terminal.
import { room } from "../data/ship";
import { moves, path, phase, position } from "../state/game";
import { InfoPanel } from "./InfoPanel";
import { useTypewriter } from "./useTypewriter";

/** Message affiché selon l'étape de la partie (les étapes suivantes viendront plus tard). */
export function protocolMessage(): string {
  if (phase.value === "place") {
    if (!position.value) return "AGENT, CHOISISSEZ VOTRE SALLE DE DÉPART";
    return `SALLE DE DÉPART : ${room(position.value).name.toUpperCase()} — VALIDEZ OU CHOISISSEZ UNE AUTRE SALLE`;
  }
  if (phase.value === "move" && position.value) {
    if (moves.value === 0) return `POSITION ENREGISTRÉE : ${room(position.value).name.toUpperCase()}`;
    // Trajet depuis la dernière validation
    const route = path.value.map(id => room(id).name.toUpperCase()).join(" → ");
    return `${route} · ${moves.value} DÉPLACEMENT${moves.value > 1 ? "S" : ""}`;
  }
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
