// Faux écrans de transition : le texte se tape ligne par ligne, comme sur le terminal du vaisseau.
import { signal } from "@preact/signals";
import { audio } from "../audio/audio";
import { settings } from "./settings";
import { sleep } from "./device";
import type { TerminalLine, TerminalScript } from "../data/terminal";

export interface ShownLine extends TerminalLine { typed: string; showResult: boolean; done: boolean; }
export interface TerminalScreen { title: string; lines: ShownLine[]; progress: number; }

/** Contenu affiché : { title, lines: [{ text, typed, result?, warn?, showResult, done }], progress } */
export const terminal = signal<TerminalScreen>({ title: "", lines: [], progress: 0 });
export const terminalOpen = signal(false);

let skip: (() => void) | null = null;

/** Passe la transition en cours (toucher l'écran, Espace, Entrée ou Échap). */
export const skipTerminal = () => skip && skip();

/** Affiche une transition et attend qu'elle soit finie (ou passée). */
export async function runTerminal({ title, lines }: TerminalScript) {
  if (!settings.transitions.value) return;
  let skipped = false;
  const skipPromise = new Promise<void>(resolve => { skip = () => { skipped = true; resolve(); }; });
  const wait = (ms: number) => Promise.race([sleep(ms), skipPromise]);

  const shown: ShownLine[] = [];
  const update = (progress: number) => { terminal.value = { title, lines: shown.map(l => ({ ...l })), progress }; };
  update(0);
  terminalOpen.value = true;

  for (let i = 0; i < lines.length && !skipped; i++) {
    const line: ShownLine = { ...lines[i], typed: "", showResult: false, done: false };
    shown.push(line);
    for (let c = 0; c < line.text.length && !skipped; c += 3) {
      line.typed = line.text.slice(0, c + 3);
      update(i / lines.length);
      if (c % 9 === 0) audio.tick();
      await wait(14);
    }
    line.typed = line.text;
    if (line.result) {
      update(i / lines.length);
      await wait(160 + Math.random() * 220);
      line.showResult = true;
    }
    line.done = true;
    update((i + 1) / lines.length);
    await wait(60);
  }
  // En cas de passage, on affiche quand même la ligne en cours en entier.
  shown.forEach(l => { l.typed = l.text; l.done = true; });
  update(1);
  if (!skipped) await wait(350);
  terminalOpen.value = false;
  skip = null;
}
