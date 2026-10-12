// Fenêtre d'informations au-dessus du pont 2.
// Vide pour l'instant : elle accueillera plus tard des informations utiles pour la partie.
import type { ComponentChildren } from "preact";

export function InfoPanel({ children }: { children?: ComponentChildren }) {
  return (
    <section class="deck info-panel" id="infoPanel" aria-label="Informations">
      <h2>INFORMATIONS</h2>
      <div class="info-body">
        {children ?? <p class="info-empty">EN ATTENTE DE DONNÉES…</p>}
      </div>
    </section>
  );
}
