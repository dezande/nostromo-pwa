import { ROOM_IDS, room, type RoomId } from "../data/ship";
import { audio } from "../audio/audio";
import { settings } from "./settings";
import * as game from "./game";

const openCount = () => ROOM_IDS.filter(id => !room(id).toxic).length;

beforeEach(() => {
  jest.useFakeTimers();
  settings.voice.value = false;
  settings.wakeLock.value = false;
  game.startGame();
});
afterEach(() => jest.useRealTimers());

/** Pose le pion et valide la salle de départ. */
function place(id: RoomId) {
  game.touchRoom(id);
  game.confirmStart();
}

/** Fin des déplacements, le Coordinateur touche les salles, puis la fermeture va jusqu'au bout. */
async function closeRooms(...rooms: RoomId[]) {
  game.validate();                   // fin des déplacements
  for (const id of rooms) game.touchRoom(id);
  const done = game.closeRooms();
  await jest.advanceTimersByTimeAsync(20_000);
  await done;
}

describe("cri du xénomorphe selon la distance", () => {
  const xeno = () => (audio.xenomorph as jest.Mock).mock.lastCall[0];

  test("pion dans la salle fermée : volume maximal", async () => {
    place("cockpit");
    await closeRooms("cockpit");
    expect(xeno()).toBe(1);
  });

  test("salle voisine, puis plus loin", async () => {
    place("cockpit");
    await closeRooms("vie");          // 1 déplacement
    expect(xeno()).toBe(0.8);
    await closeRooms("cuisine");      // cockpit → vie → cuisine : 2
    expect(xeno()).toBe(0.55);
  });

  test("deux salles fermées : la plus proche compte", async () => {
    place("cockpit");
    await closeRooms("entrepot4", "infirmerie");
    expect(xeno()).toBe(0.8);
  });
});

test("avant la partie : panneaux d'accueil, pas de partie en cours", () => {
  game.showIntro();
  expect(game.phase.value).toBe("intro");
  expect(game.inGame.value).toBe(false);
  expect(game.reachable.value.size).toBe(0);
});

describe("pose du pion", () => {
  test("toutes les salles non toxiques sont accessibles au départ", () => {
    expect(game.phase.value).toBe("place");
    expect([...game.reachable.value].sort()).toEqual(ROOM_IDS.filter(id => !room(id).toxic).sort());
  });

  test("on ne peut pas poser le pion dans une salle toxique", () => {
    game.touchRoom("labo");
    expect(game.position.value).toBeNull();
  });

  test("on peut changer de salle de départ tant qu'on n'a pas validé", () => {
    game.touchRoom("cockpit");
    game.touchRoom("entrepot4");
    expect(game.position.value).toBe("entrepot4");
    expect(game.phase.value).toBe("place");
  });

  test("Valider est impossible tant qu'aucune salle n'est choisie", () => {
    expect(game.canValidate.value).toBe(false);
    game.validate();
    expect(game.phase.value).toBe("place");
  });

  test("valider la salle de départ passe aux déplacements", () => {
    game.touchRoom("cockpit");
    game.validate();
    expect(game.phase.value).toBe("move");
    expect(game.startRoom.value).toBe("cockpit");
    expect([...game.reachable.value].sort()).toEqual(["infirmerie", "reunion", "vie"]);
  });
});

describe("déplacements", () => {
  beforeEach(() => place("cockpit"));

  test("vers une salle voisine, pas vers une salle non reliée", () => {
    game.touchRoom("entrepot1");
    expect(game.position.value).toBe("cockpit");
    game.touchRoom("vie");
    expect(game.position.value).toBe("vie");
    expect(game.moves.value).toBe(1);
  });

  test("on peut revenir sur ses pas", () => {
    game.touchRoom("vie");
    game.touchRoom("cockpit");
    expect(game.position.value).toBe("cockpit");
    expect(game.moves.value).toBe(2);
  });

  test("5 déplacements au maximum, sans message ; Annuler libère un pas ; Valider reste possible", () => {
    // cockpit → vie → cockpit → vie → cockpit → vie : 5 déplacements
    for (const id of ["vie", "cockpit", "vie", "cockpit", "vie"] as const) game.touchRoom(id);
    expect(game.moves.value).toBe(game.MAX_MOVES);
    expect(game.reachable.value.size).toBe(0);
    game.touchRoom("cuisine"); // refusé
    expect(game.position.value).toBe("vie");
    expect(game.moves.value).toBe(5);
    game.undo();
    expect(game.moves.value).toBe(4);
    expect(game.position.value).toBe("cockpit");
    expect(game.reachable.value.size).toBeGreaterThan(0);
    game.touchRoom("vie");
    expect(game.canValidate.value).toBe(true);
    game.validate();
    expect(game.phase.value).toBe("close");
  });

  test("on peut valider avec moins de 5 déplacements", () => {
    game.touchRoom("vie");
    game.validate();
    expect(game.phase.value).toBe("close");
  });

  test("le chemin suit les déplacements, Annuler retire le dernier pas", () => {
    game.touchRoom("vie");
    game.touchRoom("cuisine");
    expect(game.path.value).toEqual(["cockpit", "vie", "cuisine"]);
    game.undo();
    expect(game.path.value).toEqual(["cockpit", "vie"]);
    expect(game.position.value).toBe("vie");
  });
});

describe("choix de la salle à fermer par le Coordinateur", () => {
  beforeEach(() => { place("cockpit"); game.touchRoom("vie"); game.validate(); });

  test("Valider après les déplacements passe au choix de la salle à fermer", () => {
    expect(game.phase.value).toBe("close");
    expect(game.canValidate.value).toBe(false); // aucune salle choisie
    expect(game.reachable.value.size).toBe(0);  // le pion ne bouge plus
  });

  test("seules les salles ouvertes et non toxiques peuvent être choisies", () => {
    expect(game.closable.value.has("labo")).toBe(false);
    expect(game.closable.value.size).toBe(openCount());
    game.touchRoom("labo");
    expect(game.toClose.value.size).toBe(0);
  });

  test("toucher une salle la choisit, la toucher à nouveau la retire ; on peut en choisir deux", () => {
    game.touchRoom("cuisine");
    game.touchRoom("atelier");
    expect([...game.toClose.value].sort()).toEqual(["atelier", "cuisine"]);
    game.touchRoom("cuisine");
    expect([...game.toClose.value]).toEqual(["atelier"]);
    expect(game.canValidate.value).toBe(true);
  });

  test("Annuler revient aux déplacements", () => {
    game.touchRoom("cuisine");
    game.undo();
    expect(game.phase.value).toBe("move");
    expect(game.toClose.value.size).toBe(0);
    expect(game.position.value).toBe("vie");
  });
});

describe("fermetures", () => {
  test("la salle choisie est fermée, puis on repart pour de nouveaux déplacements", async () => {
    place("cockpit");
    game.touchRoom("vie");
    await closeRooms("atelier");
    expect([...game.closed.value]).toEqual(["atelier"]);
    expect(game.step.value).toBe(1);
    expect(game.phase.value).toBe("move");
    expect(game.moves.value).toBe(0);
    expect(game.path.value).toEqual(["vie"]); // tracé remis à zéro
  });

  test("fermeture immédiate, sans compte à rebours ; le pion ne bouge pas pendant le cri", async () => {
    place("cockpit");
    game.validate();
    game.touchRoom("atelier");
    const done = game.closeRooms();
    // La salle est fermée tout de suite.
    expect(game.closed.value.has("atelier")).toBe(true);
    expect(game.busy.value).toBe(true);
    game.touchRoom("vie");
    expect(game.position.value).toBe("cockpit");
    await jest.advanceTimersByTimeAsync(20_000);
    await done;
  });

  test("une salle fermée ne peut plus être choisie ni visitée", async () => {
    place("vie");
    await closeRooms("atelier");
    game.touchRoom("atelier");
    expect(game.position.value).toBe("vie");
    game.validate();
    expect(game.closable.value.has("atelier")).toBe(false);
  });

  test("l'agent dans une salle fermée est éliminé", async () => {
    place("cockpit");
    await closeRooms("cockpit");
    expect(game.phase.value).toBe("dead");
    expect(audio.defeat).toHaveBeenCalled();
    expect(audio.victory).not.toHaveBeenCalled();
    expect(game.ending.value).toMatchObject({ win: false });
  });

  test("après 8 fermetures, l'agent qui n'a jamais été pris survit", async () => {
    place("serre");
    const others = ROOM_IDS.filter(id => !room(id).toxic && id !== "serre");
    for (let i = 0; i < 8; i++) await closeRooms(others[i]);
    expect(game.step.value).toBe(8);
    expect(game.phase.value).toBe("win");
    expect(audio.victory).toHaveBeenCalled();
    expect(audio.defeat).not.toHaveBeenCalled();
    expect(game.ending.value!.room).toBe("Serre hydroponique");
  });

  test("l'entraînement s'arrête aussi quand il ne reste qu'une salle ouverte", async () => {
    place("serre");
    const others = ROOM_IDS.filter(id => !room(id).toxic && id !== "serre");
    // 7 étapes de deux salles ferment les 13 autres salles… sauf une : la dernière étape n'en ferme qu'une.
    for (let i = 0; i < others.length; i += 2) await closeRooms(...others.slice(i, i + 2));
    expect(game.phase.value).toBe("win");
    expect(game.step.value).toBe(7);
  });

  test("1 ou 2 salles par fermeture : une 3e est ignorée, sans message", () => {
    place("serre");
    game.validate();
    game.touchRoom("cuisine");
    game.touchRoom("atelier");
    game.touchRoom("cockpit"); // ignorée
    expect([...game.toClose.value].sort()).toEqual(["atelier", "cuisine"]);
    expect([...game.closable.value].sort()).toEqual(["atelier", "cuisine"]); // seulement pour désélectionner
    game.touchRoom("atelier"); // désélection
    game.touchRoom("cockpit");
    expect([...game.toClose.value].sort()).toEqual(["cockpit", "cuisine"]);
  });

  test("la dernière salle ouverte ne peut jamais être fermée", async () => {
    place("serre");
    const others = ROOM_IDS.filter(id => !room(id).toxic && id !== "serre" && id !== "vie");
    for (let i = 0; i < others.length; i += 2) await closeRooms(...others.slice(i, i + 2));
    // Il reste la serre et la salle de vie (6 fermetures) ; on ne peut en choisir qu'une.
    expect(game.phase.value).toBe("move");
    game.validate();
    game.touchRoom("vie");
    game.touchRoom("serre");
    expect(game.toClose.value.size).toBe(1);
  });
});
