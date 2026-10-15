// Une adresse par écran : lecture d'une adresse (parse), adresse de l'écran affiché (currentRoute),
// et application d'une adresse ouverte par le navigateur (applyRoute).
import { findSheet } from "../data/sheets";
import { resetState } from "../test/state";
import * as game from "./game";
import { applyRoute, currentRoute, parse } from "./routes";
import { settings } from "./settings";
import { briefing, choosingScenario, homeOpen, openDocument, quitAsking, settingsOpen, sourcesOpen, tutorial } from "./ui";

beforeEach(() => {
  resetState();
  settings.scenario.value = "training";
  settings.wakeLock.value = false;
});

/** Partie en cours : salle de départ validée. */
function play() {
  game.startGame();
  game.touchRoom("cockpit");
  game.confirmStart();
}

describe("parse : écran de base, et écran posé par-dessus à la fin de l'adresse", () => {
  test.each([
    ["/", "/", null],
    ["/scenario", "/scenario", null],
    ["/intro/regle-2", "/intro/regle-2", null],
    ["/partie", "/partie", null],
    ["/reglages", "/", { kind: "settings" }],
    ["/partie/reglages", "/partie", { kind: "settings" }],
    ["/sources", "/", { kind: "sources" }],
    ["/tutoriel/3", "/", { kind: "tutorial", page: 2 }],
    ["/scenario/document/guidePdf", "/scenario", { kind: "document", id: "guidePdf" }],
    ["/nimporte/quoi", "/nimporte/quoi", null],
  ])("%s", (path, base, layer) => {
    expect(parse(path)).toEqual({ base, layer });
  });
});

describe("currentRoute : l'adresse suit l'écran affiché", () => {
  test("accueil, choix du scénario, panneaux d'introduction, partie, rapport", () => {
    expect(currentRoute.value).toBe("/");
    choosingScenario.value = true;
    expect(currentRoute.value).toBe("/scenario");
    homeOpen.value = false;
    choosingScenario.value = false;
    briefing.value = "welcome";
    expect(currentRoute.value).toBe("/intro/bienvenue");
    briefing.value = 3;
    expect(currentRoute.value).toBe("/intro/regle-3");
    briefing.value = null;
    play();
    expect(currentRoute.value).toBe("/partie");
    game.phase.value = "dead"; // le rapport arrive un instant plus tard : déjà /fin
    expect(currentRoute.value).toBe("/fin");
    game.ending.value = { win: false, room: "Cockpit" };
    expect(currentRoute.value).toBe("/fin");
  });

  test("écrans posés par-dessus : réglages, sources, tutoriel, document", () => {
    settingsOpen.value = true;
    expect(currentRoute.value).toBe("/reglages");
    settingsOpen.value = false;
    sourcesOpen.value = true;
    expect(currentRoute.value).toBe("/sources");
    sourcesOpen.value = false;
    tutorial.value = 2;
    expect(currentRoute.value).toBe("/tutoriel/3");
    tutorial.value = null;
    choosingScenario.value = true;
    openDocument.value = findSheet("guidePdf");
    expect(currentRoute.value).toBe("/scenario/document/guidePdf");
    openDocument.value = null;
    settingsOpen.value = true;
    expect(currentRoute.value).toBe("/scenario/reglages");
  });

  test("en partie, le menu pause a son adresse", () => {
    play();
    settingsOpen.value = true;
    expect(currentRoute.value).toBe("/partie/reglages");
  });

  test("panneaux des autres scénarios : RH, contrat, e-mail", () => {
    homeOpen.value = false;
    briefing.value = "hr";
    expect(currentRoute.value).toBe("/intro/rh");
    briefing.value = "contract";
    expect(currentRoute.value).toBe("/intro/contrat");
    briefing.value = "email";
    expect(currentRoute.value).toBe("/intro/email");
  });
});

describe("applyRoute : une adresse ouverte par le navigateur change d'écran", () => {
  test("choix du scénario, puis retour à l'accueil", () => {
    applyRoute("/scenario");
    expect(choosingScenario.value).toBe(true);
    expect(homeOpen.value).toBe(true);
    expect(currentRoute.value).toBe("/scenario");
    applyRoute("/");
    expect(choosingScenario.value).toBe(false);
    expect(currentRoute.value).toBe("/");
  });

  test("panneau d'introduction : /intro/regle-2 ouvre la deuxième règle (la partie est remise à zéro)", () => {
    applyRoute("/intro/regle-2");
    expect(briefing.value).toBe(2);
    expect(homeOpen.value).toBe(false);
    expect(choosingScenario.value).toBe(false);
    expect(game.phase.value).toBe("intro");
    expect(currentRoute.value).toBe("/intro/regle-2");
    applyRoute("/intro/bienvenue");
    expect(briefing.value).toBe("welcome");
  });

  test("/intro/regle-9 : règle inexistante, ignorée → accueil", () => {
    applyRoute("/intro/regle-9");
    expect(briefing.value).toBeNull();
    expect(homeOpen.value).toBe(true);
    expect(currentRoute.value).toBe("/");
  });

  test("panneau d'un autre scénario : ignoré ; le contrat suit le panneau du RH", () => {
    applyRoute("/intro/rh"); // « Sixième sens » n'a pas de panneau RH
    expect(briefing.value).toBeNull();
    expect(currentRoute.value).toBe("/");
    settings.scenario.value = "recruitment";
    applyRoute("/intro/bienvenue"); // et « Une simple formalité » pas de panneau de bienvenue
    expect(briefing.value).toBeNull();
    applyRoute("/intro/rh");
    expect(briefing.value).toBe("hr");
    applyRoute("/intro/contrat");
    expect(briefing.value).toBe("contract");
    expect(currentRoute.value).toBe("/intro/contrat");
    applyRoute("/intro/email");
    expect(briefing.value).toBeNull();
    settings.scenario.value = "free"; // sans scénario : aucun panneau, pas de règles non plus
    applyRoute("/intro/regle-1");
    expect(briefing.value).toBeNull();
    expect(currentRoute.value).toBe("/");
  });

  test("tutoriel : /tutoriel/3 ouvre la page 3 ; /tutoriel/abc et une page hors limites n'ouvrent rien", () => {
    applyRoute("/tutoriel/3");
    expect(tutorial.value).toBe(2);
    expect(currentRoute.value).toBe("/tutoriel/3");
    applyRoute("/tutoriel/abc");
    expect(tutorial.value).toBeNull();
    expect(currentRoute.value).toBe("/");
    applyRoute("/tutoriel/99");
    expect(tutorial.value).toBeNull();
    applyRoute("/tutoriel/0");
    expect(tutorial.value).toBeNull();
  });

  test("document : ouvert depuis le choix du scénario ; document inconnu : le choix du scénario, sans document", () => {
    applyRoute("/scenario/document/guidePdf");
    expect(openDocument.value?.id).toBe("guidePdf");
    expect(choosingScenario.value).toBe(true);
    expect(currentRoute.value).toBe("/scenario/document/guidePdf");
    applyRoute("/scenario/document/inconnu");
    expect(openDocument.value).toBeNull();
    expect(choosingScenario.value).toBe(true);
    expect(currentRoute.value).toBe("/scenario");
  });

  test("réglages et sources, puis fermés", () => {
    applyRoute("/reglages");
    expect(settingsOpen.value).toBe(true);
    expect(currentRoute.value).toBe("/reglages");
    applyRoute("/sources");
    expect(settingsOpen.value).toBe(false);
    expect(sourcesOpen.value).toBe(true);
    expect(currentRoute.value).toBe("/sources");
    applyRoute("/");
    expect(sourcesOpen.value).toBe(false);
  });

  test("adresse de partie ou de rapport sans partie en cours : accueil (les réglages s'ouvrent quand même)", () => {
    applyRoute("/partie");
    expect(game.inGame.value).toBe(false);
    expect(homeOpen.value).toBe(true);
    expect(currentRoute.value).toBe("/");
    applyRoute("/fin");
    expect(currentRoute.value).toBe("/");
    applyRoute("/partie/reglages");
    expect(game.inGame.value).toBe(false);
    expect(currentRoute.value).toBe("/reglages");
    applyRoute("/nimporte/quoi");
    expect(currentRoute.value).toBe("/");
  });

  test("en partie : l'adresse ouvre ou ferme le menu pause, jamais la partie", () => {
    play();
    applyRoute("/partie/reglages");
    expect(settingsOpen.value).toBe(true);
    expect(game.inGame.value).toBe(true);
    quitAsking.value = true;
    applyRoute("/partie"); // « retour » pendant « Abandonner ? » : répond non et ferme le menu
    expect(settingsOpen.value).toBe(false);
    expect(quitAsking.value).toBe(false);
    applyRoute("/"); // l'accueil ou toute autre adresse : le menu pause s'ouvre, la partie continue
    expect(settingsOpen.value).toBe(true);
    expect(game.inGame.value).toBe(true);
    expect(currentRoute.value).toBe("/partie/reglages");
    applyRoute("/scenario");
    expect(settingsOpen.value).toBe(false);
    expect(game.position.value).toBe("cockpit");
  });

  test("fermeture en cours : l'adresse est ignorée", () => {
    play();
    game.busy.value = true;
    applyRoute("/partie/reglages");
    expect(settingsOpen.value).toBe(false);
  });

  test("après le rapport : une autre adresse ramène à l'accueil et efface le rapport", () => {
    play();
    game.phase.value = "win";
    game.ending.value = { win: true, room: "Cockpit" };
    applyRoute("/fin");
    expect(game.ending.value).not.toBeNull();
    applyRoute("/");
    expect(game.ending.value).toBeNull();
    expect(game.inGame.value).toBe(false);
    expect(homeOpen.value).toBe(true);
    expect(currentRoute.value).toBe("/");
  });
});
