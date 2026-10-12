// Plan du vaisseau-base : salles des deux ponts et liaisons entre elles.

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
};

// Liaisons : portes, conduits d'aération et ascenseurs (lieux de passage, pas d'arrêt).
export const LINKS = [
  ["cockpit", "reunion"], ["cockpit", "infirmerie"], ["cockpit", "vie"],
  ["reunion", "dortoir1"], ["infirmerie", "dortoir2"],
  ["vie", "dortoir1"], ["vie", "dortoir2"], ["vie", "cuisine"],
  ["dortoir1", "entrepot1", "vent"], ["dortoir2", "entrepot2", "vent"],
  ["cuisine", "entrepot1"], ["cuisine", "entrepot2"],
  ["vie", "atelier", "lift"], ["vie", "sport", "lift"], ["vie", "serre", "lift"],
  ["atelier", "entrepot3"], ["sport", "entrepot4"], ["serre", "entrepot3"], ["serre", "entrepot4"],
];

/** Salles voisines de chaque salle : ADJ.vie.has("cuisine") === true */
export const ADJ = Object.fromEntries(Object.keys(ROOMS).map(k => [k, new Set()]));
for (const [a, b] of LINKS) { ADJ[a].add(b); ADJ[b].add(a); }

/** Lignes du nom d'une salle sur le plan. */
export const roomLines = key => ROOMS[key].label || [ROOMS[key].name];

/** « Cuisine + Labo » pour une étape qui ferme plusieurs salles. */
export const stepLabel = rooms => rooms.map(k => ROOMS[k].name).join(" + ");

/** Position du pion dans une salle (sous le nom). */
export function pawnPosition(key) {
  const room = ROOMS[key];
  const [x, y] = room.center;
  if (room.pawnY) return [x, room.pawnY];
  return [x, y + (room.label ? room.label.length * 6 + 8 : 16)];
}
