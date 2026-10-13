// Logo « Weyland Corp » d'après le plan du manuel (page 8) : un W fait de trois triangles aux coins
// arrondis, encadré de deux ailes de trois bandes, et « WEYLAND CORP » dessous.
// Il prend la couleur du style d'écran (currentColor).

const WINGS = [
  "12,14 75,14 79.6,26 20.8,26", "23.7,30 81.1,30 85.6,42 32.4,42", "35.4,46 87.2,46 91.7,58 44.1,58",
  "228,14 165,14 160.4,26 219.2,26", "216.3,30 158.9,30 154.4,42 207.6,42", "204.6,46 152.8,46 148.3,58 195.9,58",
];
// Deux triangles pointe en bas, un pointe en haut entre les deux.
const W = ["81,14 117,14 101,58", "123,14 159,14 139,58", "120,24 135,58 105,58"];

export function WeylandLogo({ class: cls = "", text = true }: { class?: string; text?: boolean }) {
  return (
    <svg class={`weyland-logo ${cls}`} viewBox="0 0 240 92" aria-hidden="true" fill="currentColor">
      {WINGS.map(points => <polygon key={points} points={points} />)}
      {/* Coins arrondis : un trait de la même couleur, aux jointures arrondies */}
      <g class="weyland-w" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
        {W.map(points => <polygon key={points} points={points} />)}
      </g>
      {text && <text x="120" y="84" text-anchor="middle" class="weyland-logo-text">WEYLAND CORP</text>}
    </svg>
  );
}
