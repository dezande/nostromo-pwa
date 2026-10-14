// Tutoriel du 3D6 Système, ouvert depuis l'écran d'accueil : une règle par moniteur,
// avec un pictogramme (dés, jauges…) au trait de la couleur du style d'écran.
// Les textes sont dans src/data/tutorial.ts.
import { useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { Overlay } from "../components/Overlay";
import { Monitor } from "../components/Monitor";
import { IconButton } from "../components/Icon";
import { audio } from "../audio/audio";
import { TUTORIAL, type TutorialScene } from "../data/tutorial";
import { tutorial } from "../state/ui";

export function Tutorial() {
  const i = tutorial.value;
  const page = i === null ? null : TUTORIAL[i];
  const last = TUTORIAL.length - 1;
  useEffect(() => { if (i !== null) audio.tick(); }, [i]);
  const close = () => { tutorial.value = null; };
  return (
    <Overlay id="tutorial" show={page !== null} class="briefing">
      {page && i !== null && (
        <Monitor label={`TUTORIEL ${String(i + 1).padStart(2, "0")}/${String(TUTORIAL.length).padStart(2, "0")} · 3D6 SYSTÈME`}>
          <div class="panel briefing-panel tuto-panel">
            <div class="tuto-head">
              <div class="briefing-corp">JEU DE RÔLE · 3D6 SYSTÈME</div>
              <IconButton id="tutoClose" icon="annuler" label="Fermer le tutoriel" class="tuto-close" onClick={close} />
            </div>
            <div class="tuto-scene"><Scene name={page.scene} /></div>
            <h3 class="tuto-title">{page.title}</h3>
            <ul class="rule-points">
              {page.points.map(p => <li key={p}>{p}</li>)}
            </ul>
            {page.example && <p class="tuto-example"><span>EXEMPLE</span> {page.example}</p>}
            <div class="tuto-dots" aria-hidden="true">
              {TUTORIAL.map((_, n) => <span key={n} class={n === i ? "on" : ""} />)}
            </div>
            <div class="row icon-row briefing-actions">
              <IconButton id="tutoBack" icon="retour" label="Précédent" disabled={i === 0}
                onClick={() => { tutorial.value = i - 1; }} />
              {i < last
                ? <IconButton id="tutoNext" icon="continuer" label="Suivant" primary onClick={() => { tutorial.value = i + 1; }} />
                : <IconButton id="tutoDone" icon="valider" label="Terminer" primary onClick={close} />}
            </div>
            <div class="tuto-credit">3D6 Système – François Cedelle – licence ORC</div>
          </div>
        </Monitor>
      )}
    </Overlay>
  );
}

// ---------- Pictogrammes ----------

/**
 * Traits d'une face de dé « à traits » (de 0 à 1 dans le carré) : [x, y, largeur, hauteur].
 * 1 à 3 : autant de traits horizontaux. 4 à 6 : trois traits horizontaux, plus 1 à 3 traits verticaux.
 */
const ROWS: Record<number, number[]> = { 1: [.5], 2: [.38, .62], 3: [.3, .5, .7] };
const COLS: Record<number, number[]> = { 1: [.7], 2: [.63, .77], 3: [.57, .695, .82] };
const T = .075; // épaisseur d'un trait

function bars(v: number): [number, number, number, number][] {
  const across = v <= 3 ? .6 : .3; // traits horizontaux raccourcis pour laisser la place aux verticaux
  const left = v <= 3 ? .2 : .16;
  return [
    ...ROWS[Math.min(v, 3)].map(y => [left, y - T / 2, across, T] as [number, number, number, number]),
    ...(COLS[v - 3] ?? []).map(x => [x - T / 2, .2, T, .6] as [number, number, number, number]),
  ];
}

type DieState = "plain" | "ok" | "ko" | "crit";

/** Dé « à traits » vu de face. « ok » : succès (allumé), « ko » : raté (éteint), « crit » : échec critique (rouge). */
function Die({ x, y, v, s = "plain", size = 34 }: { x: number; y: number; v: number; s?: DieState; size?: number }) {
  return (
    <g class={`die die-${s}`} transform={`translate(${x} ${y})`} data-value={v}>
      <rect class="face" width={size} height={size} rx={size * .18} />
      {bars(v).map(([bx, by, bw, bh]) => (
        <rect key={`${bx}-${by}`} class="bar-line" x={bx * size} y={by * size} width={bw * size} height={bh * size} rx={size * .03} />
      ))}
    </g>
  );
}

function Svg({ label, children }: { label: string; children: ComponentChildren }) {
  return <svg class="tuto-svg" viewBox="0 0 300 96" role="img" aria-label={label}>{children}</svg>;
}

/** Case de caractéristique : « MEN 4 ». */
function Stat({ x, y, name, v }: { x: number; y: number; name: string; v: number }) {
  return (
    <g class="tuto-stat" transform={`translate(${x} ${y})`}>
      <rect width="56" height="44" rx="6" />
      <text x="28" y="15" class="t-small">{name}</text>
      <text x="28" y="36" class="t-big">{v}</text>
    </g>
  );
}

function Scene({ name }: { name: TutorialScene }) {
  switch (name) {
    case "test":
      return (
        <Svg label="Trois dés lancés, comparés à une caractéristique">
          <Die x={20} y={30} v={3} /><Die x={62} y={22} v={5} /><Die x={104} y={34} v={1} />
          <text x="78" y="88" class="t-small">3D6</text>
          <text x="172" y="58" class="t-big t-dim">⇄</text>
          <Stat x={204} y={14} name="MEN" v={4} />
          <text x="232" y="88" class="t-small">1 À 5</text>
        </Svg>
      );
    case "succes":
      return (
        <Svg label="Mental 4 : les dés 2 et 4 réussissent, le 6 échoue, soit 2 succès">
          <Stat x={10} y={20} name="MEN" v={4} />
          <Die x={84} y={25} v={2} s="ok" /><Die x={126} y={25} v={4} s="ok" /><Die x={168} y={25} v={6} s="ko" />
          <text x="101" y="80" class="t-small t-ok">✓</text>
          <text x="143" y="80" class="t-small t-ok">✓</text>
          <text x="185" y="80" class="t-small t-dim">✗</text>
          <text x="258" y="48" class="t-big t-ok">2</text>
          <text x="258" y="66" class="t-small t-ok">SUCCÈS</text>
        </Svg>
      );
    case "difficulte":
      return (
        <Svg label="Difficulté : Facile 1, Moyenne 2, Difficile 3, Extrême 4 succès">
          {["FACILE", "MOYENNE", "DIFFICILE", "EXTRÊME"].map((lbl, n) => (
            <g key={lbl} transform={`translate(${14 + n * 72} 0)`}>
              {Array.from({ length: n + 1 }, (_, k) => (
                <rect key={k} class={n === 3 ? "bar bar-hot" : "bar"} x="16" y={58 - k * 14} width="30" height="10" rx="2" />
              ))}
              <text x="31" y="84" class="t-small">{lbl}</text>
            </g>
          ))}
        </Svg>
      );
    case "avantage":
      return (
        <Svg label="Avantage : 4 dés. Désavantage : 2 dés">
          <text x="76" y="16" class="t-small t-ok">AVANTAGE · 4D6</text>
          <Die x={6} y={30} v={4} size={30} /><Die x={42} y={30} v={2} size={30} />
          <Die x={78} y={30} v={6} size={30} /><Die x={114} y={30} v={3} size={30} />
          <text x="76" y="86" class="t-mid t-ok">+1 DÉ</text>
          <line class="sep" x1="160" y1="12" x2="160" y2="88" />
          <text x="228" y="16" class="t-small t-warn">DÉSAVANTAGE · 2D6</text>
          <Die x={192} y={30} v={5} size={30} /><Die x={234} y={30} v={1} size={30} />
          <text x="228" y="86" class="t-mid t-warn">−1 DÉ</text>
        </Svg>
      );
    case "critique":
      return (
        <Svg label="Triple 1 : réussite critique. Triple 6 : échec critique">
          <Die x={6} y={22} v={1} s="ok" size={30} /><Die x={42} y={22} v={1} s="ok" size={30} /><Die x={78} y={22} v={1} s="ok" size={30} />
          <text x="68" y="78" class="t-small t-ok">RÉUSSITE CRITIQUE</text>
          <Die x={164} y={22} v={6} s="crit" size={30} /><Die x={200} y={22} v={6} s="crit" size={30} /><Die x={236} y={22} v={6} s="crit" size={30} />
          <text x="226" y="78" class="t-small t-red">ÉCHEC CRITIQUE</text>
        </Svg>
      );
    case "opposition":
      return (
        <Svg label="Opposition : 2 succès contre 1, le plus de succès l'emporte">
          <Person x={16} />
          <text x="86" y="40" class="t-big t-ok">2</text>
          <text x="86" y="58" class="t-small t-ok">SUCCÈS</text>
          <text x="150" y="54" class="t-big t-dim">VS</text>
          <text x="214" y="40" class="t-big t-dim">1</text>
          <text x="214" y="58" class="t-small t-dim">SUCCÈS</text>
          <Person x={244} />
          <text x="86" y="86" class="t-small t-ok">L'EMPORTE</text>
        </Svg>
      );
    case "maitrise":
      return (
        <Svg label="Maîtrises : rang 1 avantage, rang 2 effet, rang 3 effet majeur">
          {["AVANTAGE", "EFFET", "MAJEUR"].map((lbl, r) => (
            <g key={lbl} transform={`translate(${12 + r * 96} 18)`}>
              {[0, 1, 2].map(k => <rect key={k} class={k <= r ? "sq on" : "sq"} x={k * 24} y="10" width="18" height="18" />)}
              <text x="33" y="52" class="t-small">RANG {r + 1}</text>
              <text x="33" y="68" class="t-small t-ok">{lbl}</text>
            </g>
          ))}
        </Svg>
      );
    case "pe":
      return (
        <Svg label="Jauge de points d'énergie : 1 ou 2 affaibli, 0 inconscient">
          {[0, 1, 2, 3, 4, 5, 6].map(n => (
            <g key={n} transform={`translate(${18 + n * 38} 22)`}>
              <rect class={n === 0 ? "cell cell-red" : n <= 2 ? "cell cell-warn" : "cell"} width="30" height="30" rx="3" />
              <text x="15" y="20" class={n === 0 ? "t-small t-red" : n <= 2 ? "t-small t-warn" : "t-small"}>{n}</text>
            </g>
          ))}
          <text x="42" y="76" class="t-small t-red">INCONSCIENT</text>
          <text x="109" y="76" class="t-small t-warn">AFFAIBLI</text>
          <text x="223" y="76" class="t-small t-ok">EN FORME</text>
        </Svg>
      );
    case "combat":
      return (
        <Svg label="Combat : arme plus succès en plus, moins la protection">
          <g class="cross" transform="translate(44 46)">
            <circle r="26" /><circle r="10" />
            <path d="M0 -36V-16M0 16V36M-36 0H-16M16 0H36" />
          </g>
          <text x="190" y="30" class="t-small">DÉGÂTS</text>
          <text x="190" y="56" class="t-mid t-ok">ARME + SUCCÈS EN PLUS</text>
          <text x="190" y="80" class="t-mid t-warn">− PROTECTION</text>
        </Svg>
      );
  }
}

function Person({ x }: { x: number }) {
  return (
    <g class="person" transform={`translate(${x} 18)`}>
      <circle cx="20" cy="12" r="10" />
      <path d="M2 56c0-14 8-22 18-22s18 8 18 22" />
    </g>
  );
}
