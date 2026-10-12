jest.mock("../audio/audio", () => require("../test/audioMock"));

import { PROTOCOLS } from "../data/protocols";
import { ROOM_IDS, room } from "../data/ship";
import { settings } from "./settings";
import * as game from "./game";

const proto = PROTOCOLS[0];

beforeEach(() => {
  jest.useFakeTimers();
  settings.countdown.value = 3;
  settings.voice.value = false;
  settings.wakeLock.value = false;
  game.startGame(proto);
});
afterEach(() => jest.useRealTimers());

/** Lance une fermeture et fait avancer le temps jusqu'au bout. */
async function close() {
  const done = game.closeRooms();
  await jest.advanceTimersByTimeAsync(20_000);
  await done;
}

describe("pose du pion", () => {
  test("toutes les salles non toxiques sont accessibles au départ", () => {
    expect(game.phase.value).toBe("place");
    expect([...game.reachable.value].sort()).toEqual(ROOM_IDS.filter(id => !room(id).toxic).sort());
  });

  test("on ne peut pas poser le pion dans une salle toxique", () => {
    game.touchRoom("labo");
    expect(game.position.value).toBeNull();
    expect(game.phase.value).toBe("place");
  });

  test("poser le pion passe en phase de déplacement", () => {
    game.touchRoom("cockpit");
    expect(game.position.value).toBe("cockpit");
    expect(game.phase.value).toBe("move");
    expect([...game.reachable.value].sort()).toEqual(["infirmerie", "reunion", "vie"]);
  });
});

describe("déplacements", () => {
  beforeEach(() => game.touchRoom("cockpit"));

  test("vers une salle voisine", () => {
    game.touchRoom("vie");
    expect(game.position.value).toBe("vie");
    expect(game.moves.value).toBe(1);
    expect(game.trail.value).toEqual(["cockpit"]);
  });

  test("pas vers une salle non reliée", () => {
    game.touchRoom("entrepot1");
    expect(game.position.value).toBe("cockpit");
    expect(game.moves.value).toBe(0);
  });

  test("Annuler ramène à la salle précédente", () => {
    game.touchRoom("vie");
    game.touchRoom("cuisine");
    game.undo();
    expect(game.position.value).toBe("vie");
    expect(game.moves.value).toBe(1);
    game.undo();
    expect(game.position.value).toBe("cockpit");
    game.undo(); // rien à annuler
    expect(game.position.value).toBe("cockpit");
  });
});

describe("fermetures", () => {
  test("une fermeture ferme les salles de l'étape et remet les déplacements à zéro", async () => {
    game.touchRoom("cockpit");
    game.touchRoom("vie");
    await close();
    expect([...game.closed.value]).toEqual(proto.steps[0]);
    expect(game.step.value).toBe(1);
    expect(game.moves.value).toBe(0);
    expect(game.busy.value).toBe(false);
  });

  test("pendant le compte à rebours, rien ne bouge", async () => {
    game.touchRoom("cockpit");
    const done = game.closeRooms();
    expect(game.busy.value).toBe(true);
    expect(game.countdown.value).toEqual({ n: 3, room: "" });
    game.touchRoom("vie");
    expect(game.position.value).toBe("cockpit");
    expect(game.reachable.value.size).toBe(0);
    await jest.advanceTimersByTimeAsync(20_000);
    await done;
  });

  test("on ne peut plus entrer dans une salle fermée", async () => {
    game.touchRoom("vie");
    await close(); // ferme l'atelier
    game.touchRoom("atelier");
    expect(game.position.value).toBe("vie");
  });

  test("l'agent dans une salle qui ferme est éliminé", async () => {
    game.touchRoom(proto.steps[0][0]);
    await close();
    expect(game.phase.value).toBe("dead");
    expect(game.ending.value).toMatchObject({ win: false });
  });

  test("l'agent resté dans la dernière salle survit", async () => {
    const closed = new Set(proto.steps.flat());
    const survivor = ROOM_IDS.find(id => !room(id).toxic && !closed.has(id))!;
    game.touchRoom(survivor);
    for (let i = 0; i < 8; i++) await close();
    expect(game.phase.value).toBe("win");
    expect(game.ending.value).toMatchObject({ win: true });
    expect(game.ending.value!.text).toContain(room(survivor).name);
  });
});

test("newGame revient au choix du protocole", () => {
  game.touchRoom("cockpit");
  game.newGame();
  expect(game.phase.value).toBe("pick");
  expect(game.protocol.value).toBeNull();
  expect(game.position.value).toBeNull();
  expect(game.inGame.value).toBe(false);
});
