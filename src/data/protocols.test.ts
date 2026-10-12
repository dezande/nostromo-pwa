import { PROTOCOLS, STEP_COUNT } from "./protocols";
import { ROOM_IDS, room } from "./ship";

const openRooms = ROOM_IDS.filter(id => !room(id).toxic);

describe.each(PROTOCOLS.map(p => [p.id, p] as const))("protocole n°%i", (_id, protocol) => {
  test(`a ${STEP_COUNT} étapes d'une ou deux salles`, () => {
    expect(protocol.steps).toHaveLength(STEP_COUNT);
    for (const step of protocol.steps) expect([1, 2]).toContain(step.length);
  });

  test("ne ferme jamais une salle toxique ni deux fois la même salle", () => {
    const all = protocol.steps.flat();
    for (const id of all) expect(room(id).toxic).toBeFalsy();
    expect(new Set(all).size).toBe(all.length);
  });

  test("laisse exactement une salle ouverte à la fin", () => {
    const closed = new Set(protocol.steps.flat());
    expect(openRooms.filter(id => !closed.has(id))).toHaveLength(1);
  });
});

test("les numéros de protocole sont uniques", () => {
  expect(new Set(PROTOCOLS.map(p => p.id)).size).toBe(PROTOCOLS.length);
});
