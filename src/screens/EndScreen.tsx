// Fin de partie : rapport de la compagnie, affiché sur un moniteur. Les lignes s'impriment une à une
// (« génération du rapport »), puis un tampon s'appose. Un seul bouton : « Continuer », qui ramène à l'accueil
// (on rejoue depuis l'accueil avec « Démarrer »). L'alarme s'est déjà arrêtée avec la fin de la partie.
import { useEffect, useMemo, useState } from "preact/hooks";
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { Monitor } from "../components/Monitor";
import { WeylandLogo } from "../components/WeylandLogo";
import { Redact } from "../components/Redacted";
import { audio } from "../audio/audio";
import { DOC_REFS, reportNumber } from "../data/documents";
import { ending } from "../state/game";
import { returnHome } from "../state/ui";
import { settings } from "../state/settings";
import { SCENARIOS } from "../data/scenarios";

/** Durée de la « génération du rapport », avant le tampon. */
export const REPORT_MS = 1500;

export function EndScreen() {
  const end = ending.value;
  const text = SCENARIOS[settings.scenario.value];
  const report = end ? (end.win ? text.win : text.dead) : null;
  // Nouveau numéro de rapport à chaque fin de partie
  const number = useMemo(() => (end ? reportNumber(end.win) : ""), [end]);

  // Lignes du rapport : statut, texte, message d'une autre source
  const lines = report ? [
    ...(report.status ? [<p key="s" id="endText" class="end-status">{report.status}</p>] : []),
    ...report.lines.map((line, i) => (
      <p key={i} id={!report.status && i === 0 ? "endText" : undefined}><WithRoom line={line} room={end!.room} /></p>
    )),
    ...(report.note ? [<div key="n" class="end-note" id="endNote"><span class="end-note-from">{report.note.from}</span> « {report.note.text} »</div>] : []),
  ] : [];

  // Impression ligne à ligne, puis tampon
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    if (!end) return;
    const step = REPORT_MS / (lines.length + 1);
    let n = 0;
    const timer = setInterval(() => {
      n++;
      setShown(n);
      if (n > lines.length) { clearInterval(timer); audio.slam(); } else audio.tick();
    }, step);
    return () => clearInterval(timer);
  }, [end]);
  const stamped = !!end && shown > lines.length;

  return (
    <Overlay id="end" show={!!end} class="briefing">
      <Monitor label="MU/TH/UR 6000 · RAPPORT DE FIN DE SESSION" status={stamped ? "RAPPORT ARCHIVÉ" : "GÉNÉRATION DU RAPPORT…"}>
        <div class={`panel briefing-panel welcome-panel end ${end?.win ? "win" : "dead"}`} id="endPanel">
          <WeylandLogo class="logo-watermark logo-in-panel" />
          <div class="briefing-corp">WEYLAND-YUTANI CORP · {report?.header} · NOSTROMO II</div>
          <div class="doc-ref" id="endRef">{end ? DOC_REFS.report(end.win, number) : ""}</div>
          <h2 id="endTitle">{report?.title ?? ""}</h2>
          <div class="end-lines">
            {lines.map((line, i) => <div key={i} class={i < shown ? "end-line shown" : "end-line"}>{line}</div>)}
          </div>
          <div class="end-foot">
            <span class="end-generated">RAPPORT GÉNÉRÉ PAR MU/TH/UR 6000</span>
            {stamped && <span class="end-stamp" id="endStamp">{report?.stamp}</span>}
          </div>
          <div class="row icon-row briefing-actions">
            <IconButton id="endNext" icon="continuer" label="Continuer" primary
              onClick={() => { ending.value = null; returnHome(); }} />
          </div>
        </div>
      </Monitor>
    </Overlay>
  );
}

/** Remplace {room} par le nom de la salle, mis en évidence. */
function WithRoom({ line, room }: { line: string; room: string }) {
  const [before, after] = line.split("{room}");
  if (after === undefined) return <Redact text={line} />;
  return <><Redact text={before} /><span class="end-room">{room.toUpperCase()}</span><Redact text={after} /></>;
}
