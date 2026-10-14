// Panneaux purement décoratifs, façon terminal de bord : ils remplissent la place libre de l'écran de jeu.
// Valeurs fixes et sans lien avec la partie : ils ne révèlent rien (ni salles, ni ordre, ni déplacements).
import { tr } from "../i18n";

const READOUTS = (): [label: string, value: string][] => [
  [tr("PRESSION CABINE", "CABIN PRESSURE"), "1.02"],
  ["O2", "98 %"],
  [tr("LIAISON PONT 1/2", "DECK 1/2 LINK"), "OK"],
  [tr("TEMP. COQUE", "HULL TEMP."), "-41 °C"],
  [tr("GRAVITÉ ART.", "ART. GRAVITY"), "0.98 G"],
  [tr("RÉACTEUR", "REACTOR"), "NOMINAL"],
];

/** Petit panneau de relevés système (pression, oxygène, liaison…), avec voyant et barres animées. */
export function SystemPanel({ id, class: className = "" }: { id: string; class?: string }) {
  return (
    <div class={`sys-panel ${className}`} id={id} aria-hidden="true">
      <div class="sys-head"><i class="sys-led" /> SYS · MU/TH/UR 6000</div>
      <ul class="sys-list">
        {READOUTS().map(([label, value]) => (
          <li key={label}><span>{label}</span><b>{value}</b></li>
        ))}
      </ul>
      <div class="sys-bars">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 0.37) % 2}s` }} />)}</div>
    </div>
  );
}

/** Relevé discret dans le titre d'un pont. */
export function DeckReadout({ text }: { text: string }) {
  return <span class="deck-readout" aria-hidden="true">{text}</span>;
}
