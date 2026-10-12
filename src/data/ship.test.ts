import { ADJ, LIFT_POSITION, LINKS, ROOM_IDS, VENTS, pathSegments, pawnPosition, room, roomLines, stepLabel, ventBetween } from "./ship";

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

  test("le pion se place sous le nom de la salle", () => {
    expect(pawnPosition("cockpit")).toEqual([200, 176]);
    expect(pawnPosition("reunion")).toEqual([115, 220]);
    expect(pawnPosition("vie")).toEqual([200, 262]);
  });
});
