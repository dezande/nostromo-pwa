// Fenêtre d'informations au-dessus du pont 2 : un titre et un contenu libre.
import type { ComponentChildren } from "preact";

export function InfoPanel({ title = "INFORMATIONS", children }: { title?: string; children?: ComponentChildren }) {
  return (
    <section class="deck info-panel" id="infoPanel" aria-label={title} aria-live="polite">
      <h2>{title}</h2>
      <div class="info-body">
        {children ?? <p class="info-empty">EN ATTENTE DE DONNÉES…</p>}
      </div>
    </section>
  );
}
