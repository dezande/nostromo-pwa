// Une adresse par écran : /, /scenario, /intro/regle-2, /partie, /fin, plus les écrans posés par-dessus
// (/reglages, /partie/reglages, /sources, /tutoriel/3, /scenario/document/…).
// L'état de l'app (signaux) reste la référence : l'adresse en est déduite, et une adresse ouverte
// (retour ou avance du navigateur, lien, rechargement) est appliquée à l'état quand c'est possible.
// La synchronisation avec l'historique du navigateur se fait dans components/RouteSync.tsx.
import { batch, computed } from "@preact/signals";
import { busy, ending, inGame, phase, showIntro } from "./game";
import { settings } from "./settings";
import { skipTerminal, terminalOpen } from "./terminal";
import {
  briefing, choosingScenario, homeOpen, openDocument, quitAsking, returnHome, settingsOpen, sourcesOpen, tutorial,
  type BriefingPanel,
} from "./ui";
import { scenarioText } from "../data/scenarios";
import { findSheet } from "../data/sheets";
import { TUTORIAL } from "../data/tutorial";

/** Panneaux d'introduction dans l'adresse : /intro/bienvenue, /intro/regle-1… */
const PANELS: Record<Exclude<BriefingPanel, number>, string> = { welcome: "bienvenue", hr: "rh", contract: "contrat", email: "email" };
const panelSlug = (panel: BriefingPanel) => typeof panel === "number" ? `regle-${panel}` : PANELS[panel];

function panelFromSlug(slug: string): BriefingPanel | null {
  const text = scenarioText(settings.scenario.value);
  const rule = /^regle-(\d)$/.exec(slug);
  if (rule) {
    const n = Number(rule[1]);
    return n >= 1 && n <= text.rules.length && text.firstPanel ? n as BriefingPanel : null;
  }
  const panel = (Object.keys(PANELS) as (keyof typeof PANELS)[]).find(p => PANELS[p] === slug);
  // Seulement les panneaux du scénario choisi (le contrat suit le panneau du RH)
  const own = [text.firstPanel, text.lastPanel];
  return panel && own.includes(panel) || (panel === "contract" && own.includes("hr")) ? panel! : null;
}

/** Fin de partie (rapport en cours de génération ou affiché). */
const finished = () => phase.value === "dead" || phase.value === "win" || !!ending.value;

const join = (base: string, rest: string) => (base === "/" ? "" : base) + "/" + rest;

/** Adresse de l'écran affiché, sans le chemin de base du site. */
export const currentRoute = computed((): string => {
  const base = finished() ? "/fin"
    : inGame.value ? "/partie"
    : briefing.value !== null ? `/intro/${panelSlug(briefing.value)}`
    : choosingScenario.value ? "/scenario"
    : "/";
  if (openDocument.value) return join(base, `document/${openDocument.value.id ?? ""}`);
  if (tutorial.value !== null) return join(base, `tutoriel/${tutorial.value + 1}`);
  if (sourcesOpen.value) return join(base, "sources");
  if (settingsOpen.value) return join(base, "reglages");
  return base;
});

/** Écran posé par-dessus, à la fin de l'adresse. */
type Layer = { kind: "settings" } | { kind: "sources" } | { kind: "tutorial"; page: number } | { kind: "document"; id: string };

export function parse(path: string): { base: string; layer: Layer | null } {
  const parts = path.split("/").filter(Boolean);
  const last = parts.length - 1;
  let layer: Layer | null = null;
  if (parts[last] === "reglages") { layer = { kind: "settings" }; parts.pop(); }
  else if (parts[last] === "sources") { layer = { kind: "sources" }; parts.pop(); }
  else if (parts[last - 1] === "tutoriel") { layer = { kind: "tutorial", page: Number(parts[last]) - 1 }; parts.splice(-2); }
  else if (parts[last - 1] === "document") { layer = { kind: "document", id: parts[last] }; parts.splice(-2); }
  return { base: "/" + parts.join("/"), layer };
}

/**
 * Applique une adresse ouverte par le navigateur. Ce qui n'a pas de sens (partie sans partie en cours, document
 * inconnu…) est ignoré : l'adresse est ensuite corrigée d'après l'état. En partie, on ne quitte jamais la partie
 * par l'adresse : le retour ouvre ou ferme le menu pause (Réglages), d'où « Accueil » demande confirmation.
 */
export function applyRoute(path: string) {
  if (terminalOpen.value) { skipTerminal(); return; }
  if (busy.value) return; // fermeture en cours
  const { base, layer } = parse(path);

  if (inGame.value) {
    const open = base === "/partie" ? layer?.kind === "settings" : !settingsOpen.value;
    batch(() => { settingsOpen.value = open; if (!open) quitAsking.value = false; });
    return;
  }
  if (finished()) {
    if (base !== "/fin") { ending.value = null; returnHome(); }
    return;
  }

  batch(() => {
    const panel = base.startsWith("/intro/") ? panelFromSlug(base.slice("/intro/".length)) : null;
    if (panel !== null) {
      if (briefing.value === null) showIntro();
      homeOpen.value = false;
      choosingScenario.value = false;
      briefing.value = panel;
    } else {
      briefing.value = null;
      homeOpen.value = true;
      // Un document se lit depuis le choix du scénario
      choosingScenario.value = base === "/scenario" || layer?.kind === "document";
    }
    const tutoPage = layer?.kind === "tutorial" && layer.page >= 0 && layer.page < TUTORIAL.length ? layer.page : null;
    tutorial.value = tutoPage;
    sourcesOpen.value = layer?.kind === "sources";
    settingsOpen.value = layer?.kind === "settings";
    quitAsking.value = false;
    openDocument.value = layer?.kind === "document" ? findSheet(layer.id) : null;
  });
}
