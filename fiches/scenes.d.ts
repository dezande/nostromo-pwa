// Types de fiches/scenes.js pour l'app : script classique (les guides le chargent aussi en file://), il pose
// `nostromoScenes` sur globalThis au lieu d'exporter. L'app l'importe pour son effet : import "../../fiches/scenes.js".
export {};

declare global {
  var nostromoScenes: {
    /** Noms des dessins disponibles (valeurs possibles de data-illu). */
    readonly NOMS: readonly string[];
    /** SVG d'une scène avec les mots de son libellé ; null si le nom est inconnu. */
    scene(nom: string, label?: string): string | null;
    /** Dessine chaque élément [data-illu] connu sous la racine (document d'un guide, ou celui analysé par la liseuse). */
    dessiner(racine: ParentNode): void;
  };
}
