// Montage d'un composant pour les tests : dans un conteneur attaché au document (les clics, le focus et
// getComputedStyle en ont besoin), démonté automatiquement après chaque test. `$` et `$$` y cherchent.
import { render, type ComponentChild } from "preact";
import { act } from "preact/test-utils";

let root: HTMLElement | null = null;

/** Monte le composant (dans act) et renvoie son conteneur ; un montage précédent est d'abord démonté. */
export function mount(ui: ComponentChild): HTMLElement {
  unmount();
  const el = document.createElement("div");
  document.body.append(el);
  root = el;
  act(() => { render(ui, el); });
  return el;
}

/** Démonte le composant monté (rien à faire s'il n'y en a pas). */
export function unmount() {
  if (!root) return;
  render(null, root);
  root.remove();
  root = null;
}

/** Premier élément du conteneur pour ce sélecteur (null s'il n'y en a pas, comme querySelector). */
export const $ = (sel: string) => root?.querySelector(sel) as HTMLElement;
/** Tous les éléments du conteneur pour ce sélecteur. */
export const $$ = (sel: string) => [...(root?.querySelectorAll(sel) ?? [])] as HTMLElement[];

afterEach(unmount);
