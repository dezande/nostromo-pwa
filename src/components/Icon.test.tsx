jest.mock("../audio/audio", () => require("../test/audioMock"));

import { render } from "preact";
import { act } from "preact/test-utils";
import { audio } from "../audio/audio";
import { settings } from "../state/settings";
import { settingsOpen } from "../state/ui";
import { ICONS, IconButton } from "./Icon";
import { Header } from "./Header";

let root: HTMLElement;
beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
});
afterEach(() => { render(null, root); root.remove(); });

const $ = (sel: string) => root.querySelector(sel) as HTMLElement;

test("bouton icône seule : nom accessible, infobulle, SVG au trait de la couleur du style", () => {
  const onClick = jest.fn();
  act(() => { render(<IconButton id="b" icon="valider" label="Valider" onClick={onClick} />, root); });
  const btn = $("#b");
  expect(btn.getAttribute("aria-label")).toBe("Valider");
  expect(btn.getAttribute("title")).toBe("Valider");
  expect(btn.textContent).toBe("");
  const svg = btn.querySelector("svg")!;
  expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
  expect(svg.getAttribute("stroke")).toBe("currentColor");
  expect(svg.getAttribute("stroke-width")).toBe("2");
  expect(svg.getAttribute("stroke-linecap")).toBe("square");
  expect(svg.querySelector("path")!.getAttribute("d")).toBe("M5 12.5l4.5 4.5L19 7.5");
  btn.click();
  expect(onClick).toHaveBeenCalled();
});

test("toutes les icônes demandées existent", () => {
  expect(Object.keys(ICONS).sort()).toEqual(
    ["accueil", "aide", "annuler", "continuer", "demarrer", "femme", "guide", "homme", "muet", "pasArriere", "pdf", "reglages", "retour", "roles", "son", "sources", "tuto", "valider"],
  );
});

test("en-tête : bouton Son / Muet qui coupe ou remet la musique, et Réglages", () => {
  settings.music.value = false;
  act(() => { render(<Header />, root); });
  const sound = $("#soundBtn");
  expect(sound.getAttribute("aria-pressed")).toBe("false");
  expect(sound.getAttribute("aria-label")).toBe("Musique coupée");
  expect(sound.getAttribute("title")).toBe("Muet");
  act(() => { sound.click(); });
  expect(settings.music.value).toBe(true);
  expect(audio.startMusic).toHaveBeenCalled();
  expect(sound.getAttribute("aria-pressed")).toBe("true");
  expect(sound.getAttribute("aria-label")).toBe("Musique activée");
  expect(sound.getAttribute("title")).toBe("Son");
  act(() => { sound.click(); });
  expect(settings.music.value).toBe(false);

  expect($("#setBtn").getAttribute("aria-label")).toBe("Réglages");
  act(() => { $("#setBtn").click(); });
  expect(settingsOpen.value).toBe(true);
});
