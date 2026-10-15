// Synchronisation adresse ↔ écran : l'ordonnancement de Preact (rendus, puis effets) est piloté à la main pour
// reproduire exactement l'enchaînement du navigateur, en particulier la course entre deux clics enchaînés
// (« Démarrer » puis « Lancer ») qui ramenait au choix du scénario.
import { options, render } from "preact";
import { LocationProvider } from "preact-iso";
import { RouteSync } from "./RouteSync";
import { showIntro } from "../state/game";
import { currentRoute } from "../state/routes";
import { briefing, choosingScenario, homeOpen } from "../state/ui";

let renders: (() => void)[] = [];
let effects: (() => void)[] = [];
const run = (queue: (() => void)[]) => { const q = queue.splice(0); q.forEach(f => f()); };
/** Un rendu, puis les effets de ce rendu : une étape du navigateur. */
const step = () => { run(renders); run(effects); };
/** Rendus et effets jusqu'à ce que plus rien ne soit en attente. */
const settle = () => { while (renders.length || effects.length) step(); };

/** Ce que fait le bouton « Lancer » (Home.tsx) une fois le terminal passé. */
const launch = () => { homeOpen.value = false; choosingScenario.value = false; showIntro(); briefing.value = "welcome"; };

const previous = { debounce: options.debounceRendering, raf: options.requestAnimationFrame };
let root: HTMLElement;

// Comme index.html : sans <base>, jsdom prendrait l'adresse courante pour base du site.
const baseTag = document.head.appendChild(document.createElement("base"));
baseTag.href = "/";

beforeEach(() => {
  options.debounceRendering = cb => { renders.push(cb); };
  options.requestAnimationFrame = cb => { effects.push(cb); };
  history.replaceState(null, "", "/");
  showIntro();
  homeOpen.value = true;
  choosingScenario.value = false;
  briefing.value = null;
  root = document.body.appendChild(document.createElement("div"));
  render(<LocationProvider><RouteSync /></LocationProvider>, root);
  settle();
});

afterEach(() => {
  render(null, root);
  settle();
  root.remove();
  options.debounceRendering = previous.debounce;
  options.requestAnimationFrame = previous.raf;
});

test("l'adresse suit l'écran : Démarrer puis Lancer", () => {
  choosingScenario.value = true; // « Démarrer »
  settle();
  expect(location.pathname).toBe("/scenario");
  launch();
  settle();
  expect(location.pathname).toBe("/intro/bienvenue");
  expect(currentRoute.value).toBe("/intro/bienvenue");
});

test("« Lancer » avant que l'adresse /scenario soit prise en compte : le panneau de bienvenue reste", () => {
  choosingScenario.value = true;    // « Démarrer »
  step();                           // l'effet [path] ouvre /scenario et programme un nouveau rendu
  expect(location.pathname).toBe("/scenario");
  launch();                         // « Lancer », avant les effets de ce rendu
  settle();
  expect(currentRoute.value).toBe("/intro/bienvenue");
  expect(homeOpen.value).toBe(false);
  expect(location.pathname).toBe("/intro/bienvenue");
});

test("une adresse ouverte par le navigateur (retour) change bien l'écran", () => {
  choosingScenario.value = true;
  settle();
  launch();
  settle();
  // Retour du navigateur à l'entrée précédente
  history.replaceState({ i: 1, prev: "/" }, "", "/scenario");
  dispatchEvent(new PopStateEvent("popstate"));
  settle();
  expect(currentRoute.value).toBe("/scenario");
  expect(homeOpen.value).toBe(true);
  expect(briefing.value).toBeNull();
});
