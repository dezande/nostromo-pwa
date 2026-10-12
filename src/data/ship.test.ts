import { ADJ, LINKS, ROOM_IDS, pawnPosition, room, roomLines, stepLabel } from "./ship";

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

  test("le pion se place sous le nom de la salle", () => {
    expect(pawnPosition("cockpit")).toEqual([200, 176]);
    expect(pawnPosition("reunion")).toEqual([115, 220]);
    expect(pawnPosition("vie")).toEqual([200, 262]);
  });
});
