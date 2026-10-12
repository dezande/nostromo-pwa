// Plan du vaisseau-base : pont 1 (vaisseau vu de dessus) et pont 2.
import { ROOM_IDS, VENTS, room, roomLines, pathSegments, pawnPosition, type RoomId, type VentCorridor } from "../data/ship";
import { reachable, closed, closing, flashing, path, phase, position, touchRoom } from "../state/game";
import { ProtocolWindow } from "./ProtocolWindow";

const range = (from: number, to: number, stepBy: number) => Array.from({ length: Math.ceil((to - from) / stepBy) }, (_, i) => from + i * stepBy);

export function ShipMap() {
  return (
    <section class="decks">
      <div class="deck">
        <h2>PONT 1</h2>
        <svg id="deck1" viewBox="0 0 400 520" aria-label="Plan du pont 1">
          <Deck1 />
        </svg>
      </div>
      <div class="side">
        <ProtocolWindow />
        <div class="deck">
          <h2>PONT 2</h2>
          <svg id="deck2" viewBox="0 0 320 330" aria-label="Plan du pont 2">
            <Deck2 />
          </svg>
        </div>
      </div>
    </section>
  );
}

function Deck1() {
  return (
    <>
      <defs>
        {/* Hachures rouges des salles fermées */}
        <pattern id="sealed" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#3a0a0c" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#8a1418" stroke-width="3" />
        </pattern>
      </defs>

      {/* Propulseurs latéraux */}
      {[12, 352].map(x => (
        <g key={x}>
          <rect x={x} y="130" width="36" height="250" class="deco" />
          <polygon points={`${x},130 ${x + 18},104 ${x + 36},130`} class="deco" />
          <polygon points={`${x - 4},380 ${x + 40},380 ${x + 44},396 ${x - 8},396`} class="deco" />
          {range(150, 370, 26).map(y => <line key={y} x1={x + 4} y1={y} x2={x + 32} y2={y + 20} class="hatch" />)}
        </g>
      ))}
      {[[48, 160], [325, 160]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="27" height="14" class="deco" />
      ))}

      {/* Capots, nez, antenne */}
      <rect x="75" y="132" width="80" height="18" class="deco" />
      <rect x="245" y="132" width="80" height="18" class="deco" />
      {range(80, 152, 6).map(x => (
        <g key={x}>
          <line x1={x} y1="136" x2={x} y2="148" class="hatch" />
          <line x1={x + 170} y1="136" x2={x + 170} y2="148" class="hatch" />
        </g>
      ))}
      <polygon points="155,100 200,46 245,100" class="deco" />
      {range(0, 5, 1).map(i => <line key={i} x1="200" y1="50" x2={165 + i * 17.5} y2="98" class="hatch" />)}
      <line x1="200" y1="46" x2="200" y2="14" class="antenna" />

      {/* Tuyères */}
      {[56, 250].map(x => (
        <g key={x}>
          <polygon points={`${x},480 ${x + 94},480 ${x + 100},500 ${x - 6},500`} class="deco" />
          {range(0, 10, 1).map(i => <line key={i} x1={x + 2 + i * 10} y1="484" x2={x + i * 10} y2="498" class="hatch" />)}
        </g>
      ))}
      <rect x="165" y="440" width="70" height="26" class="deco" />
      {range(175, 235, 12).map(x => <line key={x} x1={x} y1="442" x2={x} y2="464" class="hatch" />)}

      <Rooms deck={1} />

      {/* Conduits d'aération : couloirs entre dortoirs et entrepôts */}
      {VENTS.map(v => <Vent key={v.rooms[0]} vent={v} />)}

      {/* Ascenseurs */}
      <Lift x={186} y={290} w={28} h={26} />
      <text x="200" y="326" class="vent-label">ASCENSEURS</text>

      <Doors list={[
        [155, 190, "v"], [245, 190, "v"], [200, 205, "h"],
        [115, 250, "h"], [285, 250, "h"],
        [155, 290, "v"], [245, 290, "v"], [200, 330, "h"],
        [155, 412, "v"], [245, 412, "v"],
        // ouvertures des conduits d'aération
        [75, 318, "v"], [65, 410, "h"], [325, 318, "v"], [335, 410, "h"],
      ]} />
      <PathTrace deck={1} />
      <Pawn deck={1} />
    </>
  );
}

function Deck2() {
  return (
    <>
      <Rooms deck={2} />
      <Lift x={145} y={44} w={30} h={30} />
      <line x1="135" y1="59" x2="145" y2="59" class="door" />
      <line x1="175" y1="59" x2="185" y2="59" class="door" />
      <line x1="160" y1="74" x2="160" y2="130" class="vent" />
      <text x="160" y="24" class="vent-label">↑ VERS SALLE DE VIE</text>
      <text x="160" y="36" class="vent-label">ASCENSEURS</text>
      <Doors list={[[87, 130, "h"], [232, 130, "h"], [135, 215, "v"], [185, 215, "v"]]} />
      <PathTrace deck={2} />
      <Pawn deck={2} />
    </>
  );
}

function Lift({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const m = (w - 16) / 2; // marge autour du petit dessin de cabine
  return (
    <>
      <rect x={x} y={y} width={w} height={h} class="lift" />
      <path d={`M${x + m} ${y + m} h16 v12 h-16 z M${x + m + 4} ${y + m + 4} h8`} class="lift-icon" />
    </>
  );
}

/** Portes : deux petits traits orange, horizontaux ("h") ou verticaux ("v"). */
type Door = [x: number, y: number, orientation: "h" | "v"];

function Doors({ list }: { list: Door[] }) {
  return list.map(([x, y, o]) => (o === "h" ? (
    <g key={`${x}-${y}`}>
      <line x1={x - 4} y1={y - 5} x2={x - 4} y2={y + 5} class="door" />
      <line x1={x + 4} y1={y - 5} x2={x + 4} y2={y + 5} class="door" />
    </g>
  ) : (
    <g key={`${x}-${y}`}>
      <line x1={x - 5} y1={y - 4} x2={x + 5} y2={y - 4} class="door" />
      <line x1={x - 5} y1={y + 4} x2={x + 5} y2={y + 4} class="door" />
    </g>
  )));
}

function Rooms({ deck }: { deck: 1 | 2 }) {
  return ROOM_IDS
    .filter(key => room(key).deck === deck)
    .map(key => <Room key={key} id={key} />);
}

function Room({ id }: { id: RoomId }) {
  const r = room(id);
  const canTouch = reachable.value.has(id);
  const classes = [
    "room",
    r.toxic && "toxic",
    closed.value.has(id) && "closed",
    canTouch && "reach",
    canTouch && phase.value === "place" && "pulse", // salles de départ possibles
    closing.value.has(id) && "closing",
    flashing.value.has(id) && "flash",
  ].filter(Boolean).join(" ");

  const lines = roomLines(id);
  const [cx, cy] = r.center;
  const top = r.labelY ?? cy - (lines.length - 1) * 6 + 3;
  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); touchRoom(id); } };

  return (
    <g class={classes} data-room={id} role="button" tabIndex={canTouch ? 0 : -1} aria-label={r.name}
      onClick={() => touchRoom(id)} onKeyDown={onKey}>
      {r.rect
        ? <rect x={r.rect[0]} y={r.rect[1]} width={r.rect[2]} height={r.rect[3]} />
        : <polygon points={r.points} />}
      {lines.map((text, i) => <text key={i} x={cx} y={top + i * 12}>{text.toUpperCase()}</text>)}
      {r.toxic && r.rect && <ToxicCross rect={r.rect} />}
    </g>
  );
}

function ToxicCross({ rect: [x, y, w, h] }: { rect: [number, number, number, number] }) {
  return (
    <>
      <line x1={x + 18} y1={y + 18} x2={x + w - 18} y2={y + h - 8} class="toxic-cross" />
      <line x1={x + w - 18} y1={y + 18} x2={x + 18} y2={y + h - 8} class="toxic-cross" />
    </>
  );
}

/** Conduit d'aération : couloir étroit, grille, étiquette ; mis en avant quand on peut l'emprunter. */
function Vent({ vent }: { vent: VentCorridor }) {
  const [x, y, w, h] = vent.rect;
  const [a, b] = vent.rooms;
  const here = position.value;
  const usable = phase.value === "move" && !!here &&
    ((here === a && reachable.value.has(b)) || (here === b && reachable.value.has(a)));
  const cx = x + w / 2, cy = y + h / 2;
  return (
    <g class={`vent-corridor ${usable ? "open" : ""}`} data-vent={`${a}-${b}`}>
      <rect x={x} y={y} width={w} height={h} rx="3" />
      {range(y + 8, y + h - 4, 8).map(gy => <line key={gy} x1={x + 3} y1={gy} x2={x + w - 3} y2={gy} class="grate" />)}
      <text x={cx} y={cy} transform={`rotate(-90 ${cx} ${cy})`} dy="2.5">VENTILATION</text>
    </g>
  );
}

/** Chemin du pion depuis la dernière validation : pointillés et numéro de chaque pas. */
function PathTrace({ deck }: { deck: 1 | 2 }) {
  const segments = pathSegments(path.value).filter(s => s.deck === deck);
  return (
    <g class="path" data-deck={deck}>
      {segments.map((s, i) => <line key={`l${i}`} class="path-line" x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} />)}
      {segments.map((s, i) => s.step && (
        <g key={`n${i}`} class="path-step" transform={`translate(${(s.from[0] + s.to[0]) / 2},${(s.from[1] + s.to[1]) / 2})`}>
          <circle r="7" />
          <text y="3">{s.step}</text>
        </g>
      ))}
    </g>
  );
}

function Pawn({ deck }: { deck: 1 | 2 }) {
  const key = position.value;
  const visible = !!key && room(key).deck === deck;
  const [x, y] = key && visible ? pawnPosition(key) : [0, 0];
  return (
    <g id={deck === 1 ? "pawn" : "pawn2"} class="pawn" visibility={visible ? "visible" : "hidden"} transform={`translate(${x},${y})`}>
      <circle r="9" class="pawn-ring" />
      <circle r="6" class="pawn-core" />
    </g>
  );
}
