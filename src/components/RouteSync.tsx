// Relie l'adresse du navigateur (preact-iso) à l'écran affiché (state/routes.ts), dans les deux sens :
// - l'app change d'écran : nouvelle entrée dans l'historique (ou retour à l'entrée précédente si c'est la même) ;
// - le navigateur change d'adresse (retour, avance, rechargement) : l'écran suit.
// Le premier écran de l'historique est toujours l'accueil : revenir à l'accueil y ramène, et un retour de plus
// quitte l'app. Les écrans sont des calques au-dessus du plan : pas de <Router>, seulement la synchronisation.
import { useEffect, useRef } from "preact/hooks";
import { useLocation } from "preact-iso";
import { applyRoute, currentRoute } from "../state/routes";

/** Position dans l'historique de l'app (0 : accueil) et adresse de l'entrée précédente. */
interface Entry { i: number; prev: string | null }
const entry = (): Entry => (history.state as Entry | null) ?? { i: 0, prev: null };

/** Chemin de base du site (« / », ou « /nostromo-pwa/ » sur GitHub Pages), donné par la balise <base>. */
const base = () => new URL(document.baseURI).pathname;
/** Adresse du navigateur → adresse de l'app (« /scenario »). */
const appPath = (url: string) => {
  const path = new URL(url, location.origin).pathname;
  return ("/" + (path.startsWith(base()) ? path.slice(base().length) : path.replace(/^\//, ""))).replace(/(.)\/+$/, "$1");
};
/** Adresse de l'app → adresse du navigateur. */
const fullPath = (path: string) => base() + path.slice(1);

export function RouteSync() {
  const { url, route } = useLocation();
  const path = currentRoute.value;
  /** Adresse de l'app actuellement dans la barre d'adresse (null avant le premier passage). */
  const shown = useRef<string | null>(null);

  /** Va à l'adresse de l'écran affiché. */
  const go = (to: string, replace = false) => {
    const here = entry();
    if (to === "/" && here.i > 0) history.go(-here.i);         // retour à l'accueil : première entrée
    else if (!replace && to === here.prev) history.back();     // écran précédent (bouton « Retour » de l'app)
    else {
      route(fullPath(to), replace);
      history.replaceState(replace ? here : { i: here.i + 1, prev: shown.current }, "", location.href);
    }
    shown.current = to;
  };

  // Le navigateur a changé d'adresse : l'écran suit, puis l'adresse est corrigée si l'écran n'a pas pu suivre.
  useEffect(() => {
    const opened = appPath(url);
    // Adresse que go() vient d'ouvrir : rien à appliquer. L'écran a pu changer entre-temps (deux clics enchaînés,
    // « Démarrer » puis « Lancer ») : l'appliquer ramènerait à l'écran précédent ; l'effet [path] suit le nouvel écran.
    const own = opened === shown.current;
    if (shown.current === null) {
      // Adresse ouverte directement : l'accueil devient la première entrée, l'écran demandé la suivante.
      if (opened !== "/" && !history.state) {
        history.replaceState({ i: 0, prev: null }, "", fullPath("/"));
        history.pushState({ i: 1, prev: "/" }, "", fullPath(opened));
      }
    }
    shown.current = opened;
    if (own || opened === currentRoute.peek()) return;
    const wasPlaying = currentRoute.peek().startsWith("/partie");
    applyRoute(opened);
    const now = currentRoute.peek();
    // En partie, l'entrée de l'écran quitté reste derrière : « retour » ouvre et ferme le menu pause.
    if (now !== opened) go(now, !wasPlaying);
  }, [url]);

  // L'app a changé d'écran : l'adresse suit (écran lu à cet instant : l'adresse ouverte a pu le changer depuis le rendu).
  useEffect(() => {
    const now = currentRoute.peek();
    if (shown.current !== null && shown.current !== now) go(now);
  }, [path]);

  return null;
}
