// Plan du vaisseau-base : salles des deux ponts et liaisons entre elles.

export interface Room {
  name: string;
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
  cockpit:    { name: "Cockpit",            deck: 1, points: "155,100 245,100 245,205 155,205", center: [200, 160] },
  reunion:    { name: "Salle de réunion",   deck: 1, rect: [75, 150, 80, 100],  center: [115, 200], label: ["Salle de", "réunion"] },
  infirmerie: { name: "Infirmerie",         deck: 1, rect: [245, 150, 80, 100], center: [285, 200] },
  vie:        { name: "Salle de vie",       deck: 1, rect: [155, 205, 90, 125], center: [200, 240], label: ["Salle", "de vie"], labelY: 228, pawnY: 262 },
  dortoir1:   { name: "Dortoir 1",          deck: 1, rect: [75, 250, 80, 80],   center: [115, 290] },
  dortoir2:   { name: "Dortoir 2",          deck: 1, rect: [245, 250, 80, 80],  center: [285, 290] },
  armurerie:  { name: "Armurerie",          deck: 1, rect: [75, 330, 80, 70],   center: [115, 365], toxic: true },
  cuisine:    { name: "Cuisine",            deck: 1, rect: [155, 330, 90, 100], center: [200, 380], label: ["Cuisine &", "salle à", "manger"] },
  labo:       { name: "Labo",               deck: 1, rect: [245, 330, 80, 70],  center: [285, 365], toxic: true },
  entrepot1:  { name: "Entrepôt 1",         deck: 1, points: "75,400 155,400 155,480 50,480 50,425", center: [105, 445] },
  entrepot2:  { name: "Entrepôt 2",         deck: 1, points: "245,400 325,400 350,425 350,480 245,480", center: [295, 445] },
  atelier:    { name: "Atelier",            deck: 2, rect: [40, 40, 95, 90],    center: [87, 85] },
  sport:      { name: "Salle de sport",     deck: 2, rect: [185, 40, 95, 90],   center: [232, 85], label: ["Salle de", "sport"] },
  serre:      { name: "Serre hydroponique", deck: 2, rect: [135, 130, 50, 150], center: [160, 200], label: ["Serre", "hydro-", "ponique"] },
  entrepot3:  { name: "Entrepôt 3",         deck: 2, points: "40,130 135,130 135,300 20,300 20,215 40,195", center: [78, 250] },
  entrepot4:  { name: "Entrepôt 4",         deck: 2, points: "185,130 280,130 280,195 300,215 300,300 185,300", center: [242, 250] },
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

/** Lignes du nom d'une salle sur le plan. */
export const roomLines = (id: RoomId): string[] => room(id).label || [room(id).name];

/** « Cuisine + Labo » pour une étape qui ferme plusieurs salles. */
export const stepLabel = (rooms: RoomId[]): string => rooms.map(k => room(k).name).join(" + ");

/**
 * Conduits d'aération du pont 1 : couloirs étroits le long de l'Armurerie et du Labo,
 * entre un dortoir et un entrepôt. `ends` = ouvertures [côté dortoir, côté entrepôt].
 */
export interface VentCorridor {
  rooms: [RoomId, RoomId];
  rect: [number, number, number, number];
  ends: [[number, number], [number, number]];
}

export const VENTS: VentCorridor[] = [
  { rooms: ["dortoir1", "entrepot1"], rect: [56, 312, 18, 100], ends: [[65, 318], [65, 410]] },
  { rooms: ["dortoir2", "entrepot2"], rect: [326, 312, 18, 100], ends: [[335, 318], [335, 410]] },
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
  return [x, y + (r.label ? r.label.length * 6 + 8 : 16)];
}
