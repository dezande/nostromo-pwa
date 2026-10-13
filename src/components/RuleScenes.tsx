// Petites scènes animées des panneaux de règles : elles reprennent le vrai plan du vaisseau
// (formes et noms des salles, couleurs, pion, tracé du chemin, croix rouge, fenêtre du
// protocole, bouton Valider), pour montrer exactement ce que le joueur verra.
import { useEffect, useState } from "preact/hooks";
import { crossLines, pathSegments, pawnPosition, room, roomLines, roomPolygon, type RoomId } from "../data/ship";

export type RuleName = "start" | "moves" | "close" | "end";

/** Fait défiler les étapes d'une scène en boucle. */
function useLoop(steps: number, ms: number): number {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % steps), ms);
    return () => clearInterval(timer);
  }, [steps, ms]);
  return step;
}

function MiniRoom({ id, class: cls = "" }: { id: RoomId; class?: string }) {
  const r = room(id);
  const lines = roomLines(id);
  const [cx, cy] = r.center;
  const top = r.labelY ?? cy - (lines.length - 1) * 6 + 3;
  const closed = cls.includes("closed") || r.toxic;
  return (
    <g class={`room ${r.toxic ? "toxic" : ""} ${cls}`}>
      <polygon points={roomPolygon(id).map(p => p.join(",")).join(" ")} />
      {lines.map((t, i) => <text key={i} x={cx} y={top + i * 12}>{t.toUpperCase()}</text>)}
      {closed && crossLines(id).map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} class="toxic-cross" />)}
    </g>
  );
}

function MiniPawn({ at }: { at: RoomId }) {
  const [x, y] = pawnPosition(at);
  return (
    <g class="pawn" transform={`translate(${x},${y})`} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <circle r="9" class="pawn-ring" />
      <circle r="6" class="pawn-core" />
    </g>
  );
}

/** Fenêtre du protocole et bouton Valider, en miniature, sous le plan. */
function MiniUi({ x, y, w, text, pressed }: { x: number; y: number; w: number; text: string; pressed?: boolean }) {
  return (
    <g class="mini-ui">
      <rect class="mini-info" x={x} y={y} width={w} height="26" rx="4" />
      <text class="mini-info-title" x={x + 6} y={y + 9}>PROTOCOLE A.I.P.</text>
      <text class="mini-info-text" x={x + 6} y={y + 20}>{text}</text>
      <rect class={`mini-validate ${pressed ? "pressed" : ""}`} x={x + w * 0.35} y={y + 32} width={w * 0.65} height="20" rx="4" />
      <text class="mini-validate-text" x={x + w * 0.675} y={y + 46}>✓ VALIDER</text>
    </g>
  );
}

const Defs = () => (
  <defs>
    <pattern id="sealed-mini" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="8" height="8" fill="#3a0a0c" />
      <line x1="0" y1="0" x2="0" y2="8" stroke="#8a1418" stroke-width="3" />
    </pattern>
  </defs>
);

const TOP_ROOMS: RoomId[] = ["cockpit", "reunion", "infirmerie", "vie", "dortoir1", "dortoir2"];

// 1. Choisir sa salle de départ : le pion hésite, puis on valide.
function StartScene() {
  const step = useLoop(5, 1100);
  const at: RoomId = (["reunion", "infirmerie", "vie", "vie", "vie"] as RoomId[])[step];
  const validated = step >= 3;
  return (
    <svg class="rule-scene" viewBox="60 95 280 300" aria-hidden="true">
      <Defs />
      {TOP_ROOMS.map(id => <MiniRoom key={id} id={id} class={validated ? "" : "reach pulse"} />)}
      <MiniPawn at={at} />
      <MiniUi x={70} y={338} w={260} pressed={step === 3}
        text={validated ? "POSITION ENREGISTRÉE : SALLE DE VIE" : `SALLE DE DÉPART : ${room(at).name.toUpperCase()}`} />
    </svg>
  );
}

// 2. Se déplacer : le pion avance de salle en salle, le chemin se trace.
const MOVES: RoomId[] = ["vie", "dortoir1", "reunion", "cockpit"];
function MovesScene() {
  const step = useLoop(MOVES.length + 2, 1000);
  const done = Math.min(step, MOVES.length - 1);
  const path = MOVES.slice(0, done + 1);
  const segments = pathSegments(path);
  return (
    <svg class="rule-scene" viewBox="60 95 280 300" aria-hidden="true">
      <Defs />
      {TOP_ROOMS.map(id => <MiniRoom key={id} id={id} />)}
      <g class="path">
        {segments.map((s, i) => <line key={i} class="path-line" x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} />)}
        {segments.map((s, i) => s.step && (
          <g key={`n${i}`} class="path-step" transform={`translate(${(s.from[0] + s.to[0]) / 2},${(s.from[1] + s.to[1]) / 2})`}>
            <circle r="7" /><text y="3">{s.step}</text>
          </g>
        ))}
      </g>
      <MiniPawn at={MOVES[done]} />
      <MiniUi x={70} y={338} w={260} pressed={step === MOVES.length}
        text={done === 0 ? "POSITION ENREGISTRÉE : SALLE DE VIE" : "DÉPLACEMENTS EN COURS"} />
    </svg>
  );
}

// 3. Fermeture : le Coordinateur touche la salle, valide, la salle se ferme avec une croix.
const MID_ROOMS: RoomId[] = ["vie", "dortoir1", "dortoir2", "armurerie", "cuisine", "labo"];
function CloseScene() {
  const step = useLoop(5, 1100);
  const selected = step === 1 || step === 2;
  const closed = step >= 3;
  return (
    <svg class={`rule-scene ${step === 3 ? "shake" : ""}`} viewBox="60 200 280 260" aria-hidden="true">
      <Defs />
      {MID_ROOMS.map(id => (
        <MiniRoom key={id} id={id} class={id === "cuisine" ? (closed ? "closed mini-closed" : selected ? "selected" : "target") : ""} />
      ))}
      <MiniPawn at="dortoir2" />
      <MiniUi x={70} y={405} w={260} pressed={step === 2}
        text={closed ? "FERMETURE DE LA SALLE : CUISINE" : selected ? "SALLE À FERMER : CUISINE" : "COORDINATEUR : TOUCHEZ LA SALLE"} />
    </svg>
  );
}

// 4. Fin : les salles se ferment une à une ; l'agent resté dans la dernière salle ouverte survit.
const ALL_ROOMS: RoomId[] = ["cockpit", "reunion", "infirmerie", "vie", "dortoir1", "dortoir2", "armurerie", "cuisine", "labo", "entrepot1", "entrepot2"];
const CLOSING_ORDER: RoomId[] = ["cuisine", "reunion", "entrepot2", "dortoir1", "cockpit", "entrepot1", "infirmerie", "dortoir2"];
function EndScene() {
  const step = useLoop(CLOSING_ORDER.length + 3, 700);
  const closedRooms = new Set(CLOSING_ORDER.slice(0, step));
  const over = step >= CLOSING_ORDER.length;
  return (
    <svg class="rule-scene" viewBox="40 95 320 445" aria-hidden="true">
      <Defs />
      {ALL_ROOMS.map(id => <MiniRoom key={id} id={id} class={closedRooms.has(id) ? "closed mini-closed" : id === "vie" && over ? "reach" : ""} />)}
      <MiniPawn at="vie" />
      <MiniUi x={60} y={488} w={280} text={over ? "AGENT SURVIVANT" : `FERMETURE ${Math.min(step + 1, 8)}/8`} />
    </svg>
  );
}

export function RuleScene({ name }: { name: RuleName }) {
  return (
    <div class={`rule-scene-box scene-${name}`}>
      {name === "start" && <StartScene />}
      {name === "moves" && <MovesScene />}
      {name === "close" && <CloseScene />}
      {name === "end" && <EndScene />}
    </div>
  );
}
