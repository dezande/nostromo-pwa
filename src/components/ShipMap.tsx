// Plan du vaisseau-base : pont 1 (vaisseau vu de dessus) et pont 2.
import { ROOM_IDS, VENTS, crossLines, markerPosition, room, roomLines, roomName, pathSegments, pawnPosition, type RoomId, type VentCorridor } from "../data/ship";
import { settings } from "../state/settings";
import { reachable, closable, closed, flashing, markerUseful, path, phase, position, toClose, touchRoom } from "../state/game";
import { pawnDeck, phoneDeck } from "../state/deckView";
import { ProtocolWindow } from "./ProtocolWindow";
import { DeckReadout, SystemPanel } from "./SystemPanel";
import { tr } from "../i18n";

const range = (from: number, to: number, stepBy: number) => Array.from({ length: Math.ceil((to - from) / stepBy) }, (_, i) => from + i * stepBy);

export function ShipMap() {
  return (
    // Tablette : pont 1 à gauche ; à droite le protocole, des relevés et le pont 2.
    // Téléphone : protocole en haut, onglets PONT 1 / PONT 2, un seul pont à la fois en grand (voir _map.scss).
    <section class={`decks show-deck-${phoneDeck.value}`}>
      <DeckTabs />
      <div class="col-main">
        <div class="deck deck-1">
          <div class="deck-head"><h2>{tr("PONT 1", "DECK 1")}</h2><DeckReadout text={tr("PRESSION 1.02 · O2 98 %", "PRESSURE 1.02 · O2 98 %")} /></div>
          <svg id="deck1" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid meet" aria-label={tr("Plan du pont 1", "Deck 1 map")}>
            <Deck1 />
          </svg>
        </div>
        <SystemPanel id="sysMain" class="sys-wide" />
      </div>
      <div class="side">
        <ProtocolWindow />
        <SystemPanel id="sysSide" class="sys-side" />
        <div class="deck deck-2">
          <div class="deck-head"><h2>{tr("PONT 2", "DECK 2")}</h2><DeckReadout text={tr("LIAISON PONT 1/2 OK", "DECK 1/2 LINK OK")} /></div>
          <svg id="deck2" viewBox="0 0 320 330" preserveAspectRatio="xMidYMid meet" aria-label={tr("Plan du pont 2", "Deck 2 map")}>
            <Deck2 />
          </svg>
        </div>
      </div>
    </section>
  );
}

/** Onglets du format Téléphone : un pont à la fois ; un voyant indique le pont où se trouve le pion. */
function DeckTabs() {
  const shown = phoneDeck.value, pawn = pawnDeck.value;
  return (
    <div class="deck-tabs" role="tablist" aria-label={tr("Ponts", "Decks")}>
      {([1, 2] as const).map(d => (
        <button key={d} type="button" role="tab" id={`deckTab${d}`} class="deck-tab" aria-selected={shown === d}
          aria-controls={`deck${d}`} onClick={() => { phoneDeck.value = d; }}>
          {tr("PONT", "DECK")} {d}
          {pawn === d && <span class="deck-tab-led" aria-label={tr("pion ici", "pawn here")} />}
        </button>
      ))}
    </div>
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
      {/* Barres qui relient les propulseurs à la coque */}
      {[[48, 160], [325, 160], [48, 335], [325, 335]].map(([x, y]) => (
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
      <text x="200" y="326" class="vent-label">{tr("ASCENSEURS", "LIFTS")}</text>

      <Doors list={[
        [155, 190, "v"], [245, 190, "v"], [200, 205, "h"],
        [115, 250, "h"], [285, 250, "h"],
        [155, 290, "v"], [245, 290, "v"], [200, 330, "h"],
        [155, 412, "v"], [245, 412, "v"],
        // portes de l'Armurerie et du Labo (contaminés : on n'y entre pas)
        [125, 330, "h"], [155, 365, "v"], [125, 400, "h"],
        [275, 330, "h"], [245, 365, "v"], [275, 400, "h"],
        // portes des conduits d'aération
        [84, 330, "h"], [84, 400, "h"], [316, 330, "h"], [316, 400, "h"],
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
      <text x="160" y="24" class="vent-label">{tr("↑ VERS SALLE DE VIE", "↑ TO LIVING QUARTERS")}</text>
      <text x="160" y="36" class="vent-label">{tr("ASCENSEURS", "LIFTS")}</text>
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
  const canTouch = reachable.value.has(id) || closable.value.has(id);
  const classes = [
    "room",
    r.toxic && "toxic",
    closed.value.has(id) && "closed",
    reachable.value.has(id) && "reach",
    reachable.value.has(id) && phase.value === "place" && "pulse", // salles de départ possibles
    closable.value.has(id) && "target",                             // salles que le Coordinateur peut fermer
    toClose.value.has(id) && "selected",                            // salles choisies pour la fermeture
    flashing.value.has(id) && "flash",
  ].filter(Boolean).join(" ");

  const lines = roomLines(id);
  const [cx, cy] = r.center;
  const top = r.labelY ?? cy - (lines.length - 1) * 6 + 3;
  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); touchRoom(id); } };

  return (
    <g class={classes} data-room={id} role="button" tabIndex={canTouch ? 0 : -1} aria-label={roomName(id)}
      onClick={() => touchRoom(id)} onKeyDown={onKey}>
      {r.rect
        ? <rect x={r.rect[0]} y={r.rect[1]} width={r.rect[2]} height={r.rect[3]} />
        : <polygon points={r.points} />}
      {lines.map((text, i) => <text key={i} x={cx} y={top + i * 12}>{text.toUpperCase()}</text>)}
      {/* Croix rouge : salles contaminées et salles fermées (elle reste) */}
      {(r.toxic || closed.value.has(id)) && <ToxicCross id={id} />}
      {r.marker && settings.markerDot.value && markerUseful.value && <circle class="marker-dot" cx={markerPosition(id)[0]} cy={markerPosition(id)[1]} r="1.8" />}
    </g>
  );
}

/** Croix rouge, calculée pour rester dans la forme réelle de la salle. */
function ToxicCross({ id }: { id: RoomId }) {
  return (
    <>
      {crossLines(id).map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} class="toxic-cross" />)}
    </>
  );
}

/**
 * Conduit d'aération : bande étroite à côté de l'Armurerie / du Labo, séparée par un double mur,
 * avec une flèche ↕ entre ses deux portes et l'étiquette « PASSAGE VENTILATION » à l'extérieur.
 * Mis en avant quand on peut l'emprunter depuis la salle du pion.
 */
function Vent({ vent }: { vent: VentCorridor }) {
  const [x, y, w, h] = vent.rect;
  const [a, b] = vent.rooms;
  const here = position.value;
  const usable = phase.value === "move" && !!here &&
    ((here === a && reachable.value.has(b)) || (here === b && reachable.value.has(a)));
  const cx = x + w / 2;
  const top = y + 8, bottom = y + h - 8;
  const [px1, py1, px2, py2] = vent.label.pointer;
  return (
    <g class={`vent-corridor ${usable ? "open" : ""}`} data-vent={`${a}-${b}`}>
      <rect x={x} y={y} width={w} height={h} />
      {/* flèche à double pointe entre les deux portes */}
      <path class="vent-arrow" d={`M${cx} ${top} V${bottom} M${cx - 3} ${top + 4} L${cx} ${top} L${cx + 3} ${top + 4} M${cx - 3} ${bottom - 4} L${cx} ${bottom} L${cx + 3} ${bottom - 4}`} />
      <line class="vent-pointer" x1={px1} y1={py1} x2={px2} y2={py2} />
      <text class="vent-label" x={vent.label.x} y={vent.label.y}>
        <tspan x={vent.label.x}>{tr("PASSAGE", "VENT")}</tspan>
        <tspan x={vent.label.x} dy="8">{tr("VENTILATION", "PASSAGE")}</tspan>
      </text>
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
