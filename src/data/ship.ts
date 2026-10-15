// Plan du vaisseau-base : salles des deux ponts et liaisons entre elles.
import { lang } from "../i18n";

export interface Room {
  name: string;
  /** nom anglais, et son découpage en lignes sur le plan s'il en faut un */
  en: { name: string; label?: string[] };
  deck: 1 | 2;
  /** [x, y, largeur, hauteur] dans le repère du plan */
  rect?: [number, number, number, number];
  /** polygone « x,y x,y … » */
  points?: string;
  /** position du nom et du pion */
  center: [number, number];
  /** nom découpé en lignes sur le plan */
  label?: string[];
  /** ordonnée imposée pour le nom / le pion */
  labelY?: number;
  pawnY?: number;
  /** atmosphère toxique : salle inaccessible */
  toxic?: boolean;
  /** repère discret pour le magicien (voir le manuel, page « Déroulement ») */
  marker?: boolean;
}

/**
 * Chaque salle :
 * - deck : 1 ou 2 (pont)
 * - rect [x, y, largeur, hauteur] ou points (polygone) dans le repère du plan
 * - center [x, y] : position du nom et du pion
 * - label : nom découpé en lignes (facultatif)
 * - toxic : salle inaccessible (atmosphère toxique)
 */
export const ROOMS = {
  cockpit:    { name: "Cockpit",            en: { name: "Cockpit" }, deck: 1, points: "155,100 245,100 245,205 155,205", center: [200, 160] },
  reunion:    { name: "Salle de réunion",   en: { name: "Meeting room", label: ["Meeting", "room"] }, deck: 1, rect: [75, 150, 80, 100],  center: [115, 200], label: ["Salle de", "réunion"], marker: true },
  infirmerie: { name: "Infirmerie",         en: { name: "Infirmary" }, deck: 1, rect: [245, 150, 80, 100], center: [285, 200], marker: true },
  vie:        { name: "Salle de vie",       en: { name: "Living quarters", label: ["Living", "quarters"] }, deck: 1, rect: [155, 205, 90, 125], center: [200, 240], label: ["Salle", "de vie"], labelY: 228, pawnY: 262, marker: true },
  dortoir1:   { name: "Dortoir 1",          en: { name: "Dorm 1" }, deck: 1, rect: [75, 250, 80, 80],   center: [115, 290] },
  dortoir2:   { name: "Dortoir 2",          en: { name: "Dorm 2" }, deck: 1, rect: [245, 250, 80, 80],  center: [285, 290] },
  armurerie:  { name: "Armurerie",          en: { name: "Armory" }, deck: 1, rect: [95, 330, 60, 70],   center: [125, 365], label: ["Armu-", "rerie"], toxic: true },
  cuisine:    { name: "Cuisine",            en: { name: "Galley", label: ["Galley &", "mess", "hall"] }, deck: 1, rect: [155, 330, 90, 100], center: [200, 380], label: ["Cuisine &", "salle à", "manger"] },
  labo:       { name: "Labo",               en: { name: "Lab" }, deck: 1, rect: [245, 330, 60, 70],  center: [275, 365], toxic: true },
  entrepot1:  { name: "Entrepôt 1",         en: { name: "Storage 1" }, deck: 1, points: "75,400 155,400 155,480 50,480 50,425", center: [105, 445], marker: true },
  entrepot2:  { name: "Entrepôt 2",         en: { name: "Storage 2" }, deck: 1, points: "245,400 325,400 350,425 350,480 245,480", center: [295, 445], marker: true },
  atelier:    { name: "Atelier",            en: { name: "Workshop" }, deck: 2, rect: [40, 40, 95, 90],    center: [87, 85] },
  sport:      { name: "Salle de sport",     en: { name: "Fitness room", label: ["Fitness", "room"] }, deck: 2, rect: [185, 40, 95, 90],   center: [232, 85], label: ["Salle de", "sport"] },
  serre:      { name: "Serre hydroponique", en: { name: "Hydroponic garden", label: ["Hydro-", "ponic", "garden"] }, deck: 2, rect: [135, 130, 50, 150], center: [160, 200], label: ["Serre", "hydro-", "ponique"] },
  entrepot3:  { name: "Entrepôt 3",         en: { name: "Storage 3" }, deck: 2, points: "40,130 135,130 135,300 20,300 20,215 40,195", center: [78, 250], marker: true },
  entrepot4:  { name: "Entrepôt 4",         en: { name: "Storage 4" }, deck: 2, points: "185,130 280,130 280,195 300,215 300,300 185,300", center: [242, 250], marker: true },
} satisfies Record<string, Room>;

export type RoomId = keyof typeof ROOMS;
export const ROOM_IDS = Object.keys(ROOMS) as RoomId[];
export const room = (id: RoomId): Room => ROOMS[id];

// Liaisons : portes, conduits d'aération et ascenseurs (lieux de passage, pas d'arrêt).
export const LINKS: [RoomId, RoomId, ("vent" | "lift")?][] = [
  ["cockpit", "reunion"], ["cockpit", "infirmerie"], ["cockpit", "vie"],
  ["reunion", "dortoir1"], ["infirmerie", "dortoir2"],
  ["vie", "dortoir1"], ["vie", "dortoir2"], ["vie", "cuisine"],
  ["dortoir1", "entrepot1", "vent"], ["dortoir2", "entrepot2", "vent"],
  ["cuisine", "entrepot1"], ["cuisine", "entrepot2"],
  ["vie", "atelier", "lift"], ["vie", "sport", "lift"], ["vie", "serre", "lift"],
  ["atelier", "entrepot3"], ["sport", "entrepot4"], ["serre", "entrepot3"], ["serre", "entrepot4"],
];

/** Salles voisines de chaque salle : ADJ.vie.has("cuisine") === true */
export const ADJ = Object.fromEntries(ROOM_IDS.map(k => [k, new Set<RoomId>()])) as Record<RoomId, Set<RoomId>>;
for (const [a, b] of LINKS) { ADJ[a].add(b); ADJ[b].add(a); }

/** Nombre minimal de déplacements entre deux salles (portes, ascenseurs, conduits), ou Infinity. */
export function distanceBetween(from: RoomId, to: RoomId): number {
  if (from === to) return 0;
  const seen = new Set<RoomId>([from]);
  let frontier: RoomId[] = [from];
  for (let d = 1; frontier.length; d++) {
    const next: RoomId[] = [];
    for (const r of frontier) for (const n of ADJ[r]) {
      if (n === to) return d;
      if (!seen.has(n)) { seen.add(n); next.push(n); }
    }
    frontier = next;
  }
  return Infinity;
}

/** Volume du cri du xénomorphe selon la distance : 1 dans la salle, puis 0,8 / 0,55 / 0,35 / 0,2, minimum 0,1. */
const XENO_VOLUMES = [1, 0.8, 0.55, 0.35, 0.2];
export const volumeForDistance = (d: number): number => XENO_VOLUMES[d] ?? 0.1;

/** Volume pour une fermeture d'une ou plusieurs salles : la plus proche du pion compte. */
export const xenoVolume = (pawn: RoomId, closedRooms: RoomId[]): number =>
  volumeForDistance(Math.min(...closedRooms.map(r => distanceBetween(pawn, r))));

/** Contour d'une salle, en liste de points. */
export function roomPolygon(id: RoomId): [number, number][] {
  const r = room(id);
  if (r.rect) {
    const [x, y, w, h] = r.rect;
    return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  }
  return r.points!.split(" ").map(p => p.split(",").map(Number) as [number, number]);
}

/** Le point est-il à l'intérieur du polygone ? (méthode du rayon) */
export function insidePolygon([px, py]: [number, number], poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Croix rouge d'une salle fermée ou contaminée : deux diagonales qui restent à l'intérieur
 * de la forme réelle de la salle, avec une marge (salles en polygone comprises).
 */
export function crossLines(id: RoomId, margin = 10): [number, number, number, number][] {
  const poly = roomPolygon(id);
  const [x, y, w, h] = roomBox(id);
  const c: [number, number] = [x + w / 2, y + h / 2];
  const toward = ([cx, cy]: [number, number]): [number, number] => {
    // On part du coin et on revient vers le centre jusqu'à être dedans avec la marge.
    const len = Math.hypot(cx - c[0], cy - c[1]);
    for (let t = 1; t > 0; t -= 0.01) {
      const p: [number, number] = [c[0] + (cx - c[0]) * t, c[1] + (cy - c[1]) * t];
      const ahead: [number, number] = [c[0] + (cx - c[0]) * (t + margin / len), c[1] + (cy - c[1]) * (t + margin / len)];
      if (insidePolygon(p, poly) && insidePolygon(ahead, poly)) return [Math.round(p[0]), Math.round(p[1])];
    }
    return c;
  };
  const [a, b, d, e] = [toward([x, y]), toward([x + w, y + h]), toward([x + w, y]), toward([x, y + h])];
  return [[...a, ...b], [...d, ...e]];
}

/** Repère discret : petit point dans le coin bas droit de la salle. */
export function markerPosition(id: RoomId): [number, number] {
  const [x, y, w, h] = roomBox(id);
  return [x + w - 6, y + h - 6];
}

/** Rectangle englobant d'une salle (pour dessiner la croix des salles fermées). */
export function roomBox(id: RoomId): [number, number, number, number] {
  const r = room(id);
  if (r.rect) return r.rect;
  const pts = r.points!.split(" ").map(p => p.split(",").map(Number));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
}

/** Nom d'une salle dans la langue de l'app. */
export const roomName = (id: RoomId): string => (lang.value === "en" ? room(id).en.name : room(id).name);

/** Lignes du nom d'une salle sur le plan, dans la langue de l'app. */
export const roomLines = (id: RoomId): string[] => {
  const r = room(id);
  return lang.value === "en" ? r.en.label || [r.en.name] : r.label || [r.name];
};

/** « Cuisine + Labo » pour une étape qui ferme plusieurs salles. */
export const stepLabel = (rooms: RoomId[]): string => rooms.map(roomName).join(" + ");

/**
 * Conduits d'aération du pont 1 (d'après le plan du manuel) : une bande étroite à l'intérieur de
 * la coque, à côté de l'Armurerie (ou du Labo), entre un dortoir et un entrepôt.
 * Ce n'est pas une salle : on la traverse en un seul déplacement.
 * `ends` = portes [côté dortoir, côté entrepôt] ; `label` = étiquette extérieure et son trait.
 */
export interface VentCorridor {
  rooms: [RoomId, RoomId];
  rect: [number, number, number, number];
  ends: [[number, number], [number, number]];
  label: { x: number; y: number; pointer: [number, number, number, number] };
}

export const VENTS: VentCorridor[] = [
  {
    rooms: ["dortoir1", "entrepot1"], rect: [75, 330, 18, 70], ends: [[84, 330], [84, 400]],
    label: { x: 26, y: 412, pointer: [38, 406, 79, 372] },
  },
  {
    rooms: ["dortoir2", "entrepot2"], rect: [307, 330, 18, 70], ends: [[316, 330], [316, 400]],
    label: { x: 374, y: 412, pointer: [362, 406, 321, 372] },
  },
];

/** Conduit d'aération entre deux salles, s'il y en a un. */
export const ventBetween = (a: RoomId, b: RoomId) =>
  VENTS.find(v => v.rooms.includes(a) && v.rooms.includes(b));

/** Centre de la cabine d'ascenseur sur chaque pont (passage entre les ponts). */
export const LIFT_POSITION: Record<1 | 2, [number, number]> = { 1: [200, 303], 2: [160, 59] };

export interface PathSegment {
  deck: 1 | 2;
  from: [number, number];
  to: [number, number];
  /** numéro du pas (1, 2, 3…) affiché sur ce segment, s'il y en a un */
  step?: number;
}

/**
 * Segments à tracer pour un chemin de salles. Quand on change de pont, le trait va
 * jusqu'à l'ascenseur sur chaque pont ; le numéro du pas est mis du côté de l'arrivée.
 * Par un conduit d'aération, le trait passe dans le couloir (numéro au milieu du couloir).
 */
export function pathSegments(path: RoomId[]): PathSegment[] {
  const segments: PathSegment[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = room(path[i - 1]), b = room(path[i]);
    const from = pawnPosition(path[i - 1]), to = pawnPosition(path[i]);
    const vent = ventBetween(path[i - 1], path[i]);
    if (vent) {
      const [start, end] = vent.rooms[0] === path[i - 1] ? vent.ends : [vent.ends[1], vent.ends[0]];
      segments.push({ deck: a.deck, from, to: start });
      segments.push({ deck: a.deck, from: start, to: end, step: i });
      segments.push({ deck: a.deck, from: end, to });
    } else if (a.deck === b.deck) {
      segments.push({ deck: a.deck, from, to, step: i });
    } else {
      segments.push({ deck: a.deck, from, to: LIFT_POSITION[a.deck] });
      segments.push({ deck: b.deck, from: LIFT_POSITION[b.deck], to, step: i });
    }
  }
  return segments;
}

/** Position du pion dans une salle (sous le nom). */
export function pawnPosition(id: RoomId): [number, number] {
  const r = room(id);
  const [x, y] = r.center;
  if (r.pawnY) return [x, r.pawnY];
  const lines = roomLines(id);
  return [x, y + (lines.length > 1 ? lines.length * 6 + 8 : 16)];
}
