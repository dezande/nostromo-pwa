// Fin de partie : rapport de la compagnie, dans le style du panneau de bienvenue.
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { WeylandLogo } from "../components/WeylandLogo";
import { ending, startGame } from "../state/game";
import { returnHome } from "../state/ui";
import { settings } from "../state/settings";
import { SCENARIOS } from "../data/scenarios";

export function EndScreen() {
  const end = ending.value;
  const text = SCENARIOS[settings.scenario.value];
  const report = end ? (end.win ? text.win : text.dead) : null;
  return (
    <Overlay id="end" show={!!end} class="briefing">
      <div class={`panel briefing-panel welcome-panel end ${end?.win ? "win" : "dead"}`} id="endPanel">
        <WeylandLogo class="logo-watermark logo-in-panel" />
        <div class="briefing-corp">
          WEYLAND-YUTANI CORP · {report?.header} · NOSTROMO II
        </div>
        <div class="briefing-motto">« Building Better Worlds »</div>
        <h2 id="endTitle">{report?.title ?? ""}</h2>
        {end && report && (
          <>
            {report.status && <p id="endText" class="end-status">{report.status}</p>}
            {report.lines.map((line, i) => (
              <p key={i} id={!report.status && i === 0 ? "endText" : undefined}>
                <WithRoom line={line} room={end.room} />
              </p>
            ))}
          </>
        )}
        <div class="row icon-row briefing-actions">
          <IconButton id="endMenuBtn" icon="accueil" label="Accueil" onClick={() => { ending.value = null; returnHome(); }} />
          <IconButton id="againBtn" icon="demarrer" label="Rejouer" primary onClick={startGame} />
        </div>
      </div>
    </Overlay>
  );
}

/** Remplace {room} par le nom de la salle, mis en évidence. */
function WithRoom({ line, room }: { line: string; room: string }) {
  const [before, after] = line.split("{room}");
  if (after === undefined) return <>{line}</>;
  return <>{before}<span class="end-room">{room.toUpperCase()}</span>{after}</>;
}
