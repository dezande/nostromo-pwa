// Logo « Weyland Corp » d'après le plan du manuel (page 8), validé avec le magicien :
// un W de trois triangles aux coins arrondis (deux pointes en bas, un pointe en haut),
// deux ailes de trois bandes aux angles vifs, et « WEYLAND CORP » juste dessous.
// Il prend la couleur du style d'écran (currentColor).
import "@fontsource/questrial/latin-400.css"; // police du nom, embarquée pour le mode hors ligne

const W = [
  "67.4,15.6 112.6,15.6 90,54.8",
  "127.4,15.6 172.6,15.6 150,54.8",
  "120,17.2 142.6,56.4 97.4,56.4",
];
const WINGS = [
  "4,14 60,14 66.9,26 12.8,26", "236,14 180,14 173.1,26 227.2,26",
  "15.7,30 69.2,30 76.2,42 24.4,42", "224.3,30 170.8,30 163.8,42 215.6,42",
  "27.4,46 78.5,46 85.4,58 36.1,58", "212.6,46 161.5,46 154.6,58 203.9,58",
];

export function WeylandLogo({ class: cls = "", text = true }: { class?: string; text?: boolean }) {
  return (
    <svg class={`weyland-logo ${cls}`} viewBox="0 0 240 78" aria-hidden="true" fill="currentColor">
      {/* Triangles : coins arrondis grâce à un trait de la même couleur */}
      <g class="weyland-w" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round">
        {W.map(points => <polygon key={points} points={points} />)}
      </g>
      {/* Ailes : angles vifs */}
      <g class="weyland-wings">
        {WINGS.map(points => <polygon key={points} points={points} />)}
      </g>
      {text && (
        <text x="120" y="74" text-anchor="middle" textLength="160" lengthAdjust="spacingAndGlyphs" class="weyland-logo-text">
          WEYLAND CORP
        </text>
      )}
    </svg>
  );
}
