// Moniteur mural de la salle de briefing : cadre, étiquette en haut, voyant et état en bas.
// Les panneaux d'introduction (bienvenue, règles, RH, contrat, e-mail) s'affichent dedans.
import type { ComponentChildren } from "preact";
import { tr } from "../i18n";

/** Salle où l'instructeur présente les moniteurs. */
export const briefingRoom = () => tr("SALLE DE BRIEFING B-7", "BRIEFING ROOM B-7");

interface Props {
  /** Étiquette du moniteur, ex. « MONITEUR 01 · SALLE DE BRIEFING ». */
  label: string;
  /** Texte à côté du voyant, ex. « EN LIGNE ». */
  status?: string;
  children: ComponentChildren;
}

export function Monitor({ label, status = tr("EN LIGNE", "ONLINE"), children }: Props) {
  return (
    <div class="monitor">
      <div class="monitor-top"><span class="monitor-label">{label}</span><span class="monitor-brand">W.Y.C.</span></div>
      {children}
      <div class="monitor-foot"><span class="monitor-led" aria-hidden="true" /><span class="monitor-status">{status}</span></div>
    </div>
  );
}
