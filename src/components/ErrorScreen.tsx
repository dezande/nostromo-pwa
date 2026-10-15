// Écran de secours quand l'app plante. Sans lui, une erreur laisserait un écran noir muet sur la tablette.
// Deux sources d'erreurs : pendant l'affichage (rattrapées par <ErrorBoundary>, qui remplace l'app par l'écran)
// et hors affichage (gestionnaires d'évènements, minuteurs, promesses : main.tsx les signale avec report()).
import { Component, type ComponentChildren } from "preact";
import { signal } from "@preact/signals";
import { Overlay } from "./Overlay";
import { Monitor } from "./Monitor";
import { BUILD } from "../state/pwa";
import { returnHome } from "../state/ui";
import { tr } from "../i18n";

/** Erreur survenue hors affichage (voir main.tsx), ou null. */
export const crash = signal<unknown>(null);

/** Signale une erreur survenue hors affichage : l'écran de secours s'affiche. */
export function report(error: unknown) {
  crash.value = error ?? "Erreur inconnue / Unknown error";
}

/** Message et pile de l'erreur, quelle que soit sa forme (Error, texte, autre chose). */
export function describeError(error: unknown): { message: string; stack: string } {
  if (error instanceof Error) {
    const message = `${error.name}: ${error.message}`;
    // Chrome répète le message en tête de la pile, Firefox et Safari non.
    const stack = error.stack ?? "";
    return { message, stack: stack.startsWith(message) ? stack.slice(message.length).trim() : stack.trim() };
  }
  return { message: String(error), stack: "" };
}

interface ScreenProps {
  error: unknown;
  /** « Retour à l'accueil » : vide l'erreur et ramène à l'accueil. */
  onHome: () => void;
}

export function ErrorScreen({ error, onHome }: ScreenProps) {
  const { message, stack } = describeError(error);
  const commit = BUILD.commit ? ` (${BUILD.commit})` : "";
  return (
    <Overlay id="crash" show class="briefing" role="alertdialog" aria-labelledby="crashTitle">
      <Monitor label={tr("MU/TH/UR 6000 · DIAGNOSTIC", "MU/TH/UR 6000 · DIAGNOSTICS")} status={tr("DÉFAILLANCE", "FAILURE")}>
        <div class="panel briefing-panel crash-panel">
          <div class="briefing-corp">WEYLAND-YUTANI CORP · MAINTENANCE</div>
          <h2 id="crashTitle">{tr("DÉFAILLANCE SYSTÈME", "SYSTEM FAILURE")}</h2>
          <p>
            {tr("Le programme a rencontré une erreur imprévue et s'est arrêté. "
              + "Rechargez la page pour reprendre, ou revenez à l'accueil : la partie en cours est abandonnée.",
            "The program ran into an unexpected error and stopped. "
              + "Reload the page to resume, or go back to home: the current game is abandoned.")}
          </p>
          {/* Détails pour le diagnostic : message, pile et numéro de build (à envoyer avec un signalement). */}
          <pre class="crash-details" id="crashDetails"><strong>{message}</strong>{stack && `\n${stack}`}</pre>
          <div class="version" id="crashBuild">NOSTROMO II · v{BUILD.version} · BUILD {BUILD.number}{commit}</div>
          <div class="row crash-actions">
            <button type="button" id="crashReload" onClick={() => location.reload()}>{tr("Recharger", "Reload")}</button>
            <button type="button" id="crashHome" onClick={onHome}>{tr("Retour à l'accueil", "Back to home")}</button>
          </div>
        </div>
      </Monitor>
    </Overlay>
  );
}

interface BoundaryState { error: unknown }

/** Rattrape les erreurs d'affichage de l'app (et affiche aussi celles signalées par report()). */
export class ErrorBoundary extends Component<{ children: ComponentChildren }, BoundaryState> {
  state: BoundaryState = { error: null };

  componentDidCatch(error: unknown) {
    console.error(error);
    this.setState({ error: error ?? "Erreur inconnue / Unknown error" });
  }

  home = () => {
    crash.value = null;
    this.setState({ error: null });
    // Le plantage a pu survenir pendant un compte à rebours ou une transition : on force le retour.
    returnHome(true);
  };

  render() {
    const error = this.state.error ?? crash.value;
    if (error === null) return this.props.children;
    // L'app n'est plus affichée : si elle plante à l'affichage, la montrer derrière replanterait.
    return <ErrorScreen error={error} onHome={this.home} />;
  }
}
