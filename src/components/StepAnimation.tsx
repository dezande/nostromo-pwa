// Petits dessins animés du panneau « Le protocole », un par étape.
// Ils prennent les couleurs du style d'écran ; les animations sont coupées si le système le demande.

export type StepName = "start" | "moves" | "close" | "end";

export function StepAnimation({ name }: { name: StepName }) {
  return (
    <svg class={`step-anim step-${name}`} viewBox="0 0 120 80" aria-hidden="true">
      {DRAWINGS[name]}
    </svg>
  );
}

const Room = ({ x, y, w = 30, h = 30, class: c = "" }: { x: number; y: number; w?: number; h?: number; class?: string }) =>
  <rect class={`sa-room ${c}`} x={x} y={y} width={w} height={h} />;

const DRAWINGS: Record<StepName, preact.JSX.Element> = {
  // 1. Le pion hésite entre plusieurs salles, puis la salle est validée.
  start: (
    <>
      <Room x={6} y={25} /><Room x={45} y={25} /><Room x={84} y={25} />
      <g class="sa-pawn"><circle r="6" class="sa-pawn-ring" /><circle r="4" class="sa-pawn-core" /></g>
      <path class="sa-check" d="M52 14 l5 5 l10 -10" />
    </>
  ),
  // 2. Une carte W.Y.C. se retourne, puis le pion avance de salle en salle.
  moves: (
    <>
      <g class="sa-card"><rect x="4" y="18" width="26" height="40" rx="3" /><text x="17" y="44">3</text></g>
      <Room x={36} y={28} w={20} h={24} /><Room x={58} y={28} w={20} h={24} /><Room x={80} y={28} w={20} h={24} /><Room x={102} y={28} w={14} h={24} />
      <line class="sa-trail" x1="46" y1="40" x2="112" y2="40" />
      <g class="sa-pawn"><circle r="4" class="sa-pawn-core" /></g>
    </>
  ),
  // 3. La porte se ferme, la salle passe au rouge, l'alien apparaît.
  close: (
    <>
      <rect class="sa-room sa-closing" x="30" y="14" width="60" height="52" />
      <path class="sa-alien" d="M60 30 c-10 0 -14 8 -10 14 c3 5 7 8 10 14 c3 -6 7 -9 10 -14 c4 -6 0 -14 -10 -14 Z" />
      <rect class="sa-door" x="24" y="14" width="6" height="52" />
      <text class="sa-warn" x="60" y="78">!</text>
    </>
  ),
  // 4. Les salles se ferment une à une ; seule la dernière reste ouverte, avec l'agent.
  end: (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map(i => {
        const x = 6 + (i % 4) * 28, y = 8 + Math.floor(i / 4) * 34;
        return (
          <g key={i} class="sa-shut" style={{ animationDelay: `${i * 0.35}s` }}>
            <Room x={x} y={y} w={24} h={28} />
            <path class="sa-x" d={`M${x + 6} ${y + 7} l12 14 M${x + 18} ${y + 7} l-12 14`} style={{ animationDelay: `${i * 0.35}s` }} />
          </g>
        );
      })}
      <Room x={90} y={42} w={24} h={28} class="sa-survivor" />
      <circle cx="102" cy="56" r="4" class="sa-pawn-core sa-glow" />
    </>
  ),
};
