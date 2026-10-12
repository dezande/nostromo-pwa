// Choix du protocole A.I.P.
import { Overlay } from "../components/Overlay";
import { Icon } from "../components/Icon";
import { audio } from "../audio/audio";
import { PROTOCOLS, type Protocol } from "../data/protocols";
import { protocolLoading } from "../data/terminal";
import { phase, startGame } from "../state/game";
import { runTerminal, terminalOpen } from "../state/terminal";
import { homeOpen, openMenu } from "../state/ui";

async function choose(proto: Protocol) {
  if (terminalOpen.value) return;
  audio.init();
  await runTerminal(protocolLoading(proto));
  startGame(proto);
}

export function ProtocolPicker() {
  return (
    <Overlay id="pick" show={phase.value === "pick" && !homeOpen.value}>
      <div class="panel">
        <h2>ALIEN INTRUSION PROTOCOL</h2>
        <p>Le Psychic Agent choisit le protocole. Il établit l'ordre de fermeture des salles du vaisseau-base. Seuls les agents présents dans la dernière salle survivent.</p>
        <div class="protos" id="protos">
          {PROTOCOLS.map(p => (
            <button key={p.id} class="proto" onClick={() => choose(p)}>
              <strong>PROTOCOLE {p.id}</strong>
              <small>
                Date : {p.date}<br />
                Instructeur : {p.instructor}<br />
                Participants : {p.participants}<br />
                Conclusion : {p.conclusion}
              </small>
            </button>
          ))}
        </div>
        <div class="row spaced">
          <button id="pickMenuBtn" onClick={openMenu}><Icon name="menu" /> Menu</button>
        </div>
      </div>
    </Overlay>
  );
}
