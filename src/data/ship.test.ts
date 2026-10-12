import { ADJ, LIFT_POSITION, LINKS, ROOM_IDS, VENTS, distanceBetween, pathSegments, pawnPosition, room, roomBox, roomLines, stepLabel, ventBetween, volumeForDistance, xenoVolume } from "./ship";

describe("plan du vaisseau", () => {
  test("16 salles, dont 2 toxiques", () => {
    expect(ROOM_IDS).toHaveLength(16);
    expect(ROOM_IDS.filter(id => room(id).toxic).sort()).toEqual(["armurerie", "labo"]);
  });

  test("chaque salle a une forme (rectangle ou polygone)", () => {
    for (const id of ROOM_IDS) expect(room(id).rect ?? room(id).points).toBeTruthy();
  });

  test("les liaisons relient des salles existantes, sans doublon", () => {
    const seen = new Set<string>();
    for (const [a, b] of LINKS) {
      expect(ROOM_IDS).toContain(a);
      expect(ROOM_IDS).toContain(b);
      const key = [a, b].sort().join("-");
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  test("les liaisons marchent dans les deux sens", () => {
    for (const a of ROOM_IDS) for (const b of ADJ[a]) expect(ADJ[b].has(a)).toBe(true);
  });

  test("les salles toxiques ne sont reliées à rien", () => {
    expect(ADJ.armurerie.size).toBe(0);
    expect(ADJ.labo.size).toBe(0);
  });

  test("toutes les salles accessibles sont reliées entre elles", () => {
    const open = ROOM_IDS.filter(id => !room(id).toxic);
    const visited = new Set(["cockpit"]);
    const queue = ["cockpit" as const] as (typeof open)[number][];
    while (queue.length) for (const next of ADJ[queue.shift()!]) if (!visited.has(next)) { visited.add(next); queue.push(next); }
    expect([...visited].sort()).toEqual([...open].sort());
  });

  test("les ascenseurs relient la salle de vie au pont 2", () => {
    expect([...ADJ.vie].filter(id => room(id).deck === 2).sort()).toEqual(["atelier", "serre", "sport"]);
  });

  test("noms affichés", () => {
    expect(roomLines("cockpit")).toEqual(["Cockpit"]);
    expect(roomLines("serre")).toEqual(["Serre", "hydro-", "ponique"]);
    expect(stepLabel(["cuisine", "labo"])).toBe("Cuisine + Labo");
  });

  test("tracé du chemin : un segment numéroté par pas sur le même pont", () => {
    expect(pathSegments(["cockpit"])).toEqual([]);
    expect(pathSegments(["cockpit", "vie", "cuisine"])).toEqual([
      { deck: 1, from: pawnPosition("cockpit"), to: pawnPosition("vie"), step: 1 },
      { deck: 1, from: pawnPosition("vie"), to: pawnPosition("cuisine"), step: 2 },
    ]);
  });

  test("tracé du chemin : changement de pont par l'ascenseur", () => {
    expect(pathSegments(["vie", "atelier"])).toEqual([
      { deck: 1, from: pawnPosition("vie"), to: LIFT_POSITION[1] },
      { deck: 2, from: LIFT_POSITION[2], to: pawnPosition("atelier"), step: 1 },
    ]);
  });

  test("les conduits d'aération relient dortoirs et entrepôts, et chaque conduit correspond à une liaison", () => {
    expect(ADJ.dortoir1.has("entrepot1")).toBe(true);
    expect(ADJ.dortoir2.has("entrepot2")).toBe(true);
    for (const v of VENTS) expect(ADJ[v.rooms[0]].has(v.rooms[1])).toBe(true);
    expect(ventBetween("entrepot1", "dortoir1")).toBe(VENTS[0]);
    expect(ventBetween("cuisine", "entrepot1")).toBeUndefined();
  });

  test("chaque conduit est une bande étroite dans la coque, entre le dortoir et l'entrepôt, à côté de la salle toxique", () => {
    const [left, right] = VENTS;
    const armurerie = room("armurerie").rect!, labo = room("labo").rect!;
    // Gauche : bande puis double mur puis Armurerie ; droite : Labo puis double mur puis bande.
    expect(left.rect[0] + left.rect[2]).toBeLessThan(armurerie[0]);
    expect(labo[0] + labo[2]).toBeLessThan(right.rect[0]);
    for (const v of VENTS) {
      const [, y, w, h] = v.rect;
      expect(w).toBeLessThanOrEqual(20);
      expect(y).toBe(room(v.rooms[0]).rect![1] + room(v.rooms[0]).rect![3]); // collée au dortoir
      expect(v.ends[0][1]).toBe(y);
      expect(v.ends[1][1]).toBe(y + h);
    }
  });

  test("tracé du chemin : par un conduit d'aération, le trait passe dans le couloir", () => {
    const [top, bottom] = VENTS[0].ends;
    expect(pathSegments(["dortoir1", "entrepot1"])).toEqual([
      { deck: 1, from: pawnPosition("dortoir1"), to: top },
      { deck: 1, from: top, to: bottom, step: 1 },
      { deck: 1, from: bottom, to: pawnPosition("entrepot1") },
    ]);
    // Dans l'autre sens, le couloir est parcouru à l'envers.
    expect(pathSegments(["entrepot1", "dortoir1"])[1]).toEqual({ deck: 1, from: bottom, to: top, step: 1 });
  });

  test("distance en nombre de déplacements (portes, ascenseurs, conduits)", () => {
    expect(distanceBetween("cockpit", "cockpit")).toBe(0);
    expect(distanceBetween("cockpit", "vie")).toBe(1);
    expect(distanceBetween("cockpit", "cuisine")).toBe(2);
    expect(distanceBetween("dortoir1", "entrepot1")).toBe(1); // par le conduit d'aération
    expect(distanceBetween("cockpit", "atelier")).toBe(2);    // par l'ascenseur
    expect(distanceBetween("entrepot1", "entrepot3")).toBe(4); // cuisine, salle de vie, atelier
    expect(distanceBetween("cockpit", "labo")).toBe(Infinity); // salle contaminée, isolée
  });

  test("volume du cri selon la distance : 1, 0,8, 0,55, 0,35, 0,2 puis 0,1", () => {
    expect([0, 1, 2, 3, 4, 5, 6, Infinity].map(volumeForDistance)).toEqual([1, 0.8, 0.55, 0.35, 0.2, 0.1, 0.1, 0.1]);
    expect(xenoVolume("cockpit", ["entrepot4", "vie"])).toBe(0.8); // la plus proche
    expect(xenoVolume("cockpit", ["cockpit"])).toBe(1);
  });

  test("rectangle englobant (salles en polygone comprises)", () => {
    expect(roomBox("dortoir1")).toEqual([75, 250, 80, 80]);
    expect(roomBox("cockpit")).toEqual([155, 100, 90, 105]);
  });

  test("le pion se place sous le nom de la salle", () => {
    expect(pawnPosition("cockpit")).toEqual([200, 176]);
    expect(pawnPosition("reunion")).toEqual([115, 220]);
    expect(pawnPosition("vie")).toEqual([200, 262]);
  });
});
