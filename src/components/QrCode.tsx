// QR code en SVG, calculé dans le navigateur (fonctionne hors ligne).
// Modules sombres sur fond clair, aux couleurs du style d'écran : c'est le sens que lisent tous les téléphones.
import { encode } from "uqr";

const MARGIN = 2; // zone blanche autour du code, en modules

export function QrCode({ text, label }: { text: string; label: string }) {
  const { size, data } = encode(text, { border: 0 });
  // Un rectangle par suite de modules sombres sur une ligne : chemin court, sans couture entre les carrés
  let d = "";
  data.forEach((row, y) => {
    for (let x = 0; x < size; x++) {
      if (!row[x]) continue;
      let w = 1;
      while (row[x + w]) w++;
      d += `M${x + MARGIN} ${y + MARGIN}h${w}v1h-${w}z`;
      x += w;
    }
  });
  const full = size + 2 * MARGIN;
  return (
    <svg class="qr" viewBox={`0 0 ${full} ${full}`} role="img" aria-label={label} shape-rendering="crispEdges">
      <rect class="qr-bg" width={full} height={full} />
      <path class="qr-on" d={d} />
    </svg>
  );
}
