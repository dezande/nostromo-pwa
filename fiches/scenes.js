// Scènes clés des guides du Superviseur : vignettes dessinées en traits noirs (SVG), insérées au chargement
// dans chaque <div class="illu" data-illu="nom" data-label="…"></div> de la bande .scenes.
// Même style que les illustrations des prétirés (pretire.js) : encre noire, fonds blancs, hachures pour les ombres.
// Les mots qui apparaissent dans un dessin (écran, tampon, plaque) viennent de data-label, pour que la page
// anglaise affiche les siens ; le dessin, lui, est le même dans les deux langues.
(() => {
  const SVG = 'xmlns="http://www.w3.org/2000/svg"';
  let uid = 0;

  // Toute vignette a le même cadre (2:1) et le même trait ; le contenu est dessiné par-dessus.
  const vignette = contenu =>
    `<svg ${SVG} viewBox="0 0 160 80" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${contenu}</svg>`;
  const hachures = (id, angle = -35) =>
    `<defs><pattern id="${id}" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><path d="M0 0v2.4" stroke="#000" stroke-width="0.7"/></pattern></defs>`;
  // Texte centré, dans la police du document ; `max` borne la largeur : la taille baisse si le libellé est long.
  const texte = (x, y, mot, taille, max) => {
    const t = max ? Math.min(taille, max / (mot.length * 0.62)) : taille;
    return `<text x="${x}" y="${y}" font-family="IBM Plex Mono, monospace" font-weight="700" font-size="${t}" text-anchor="middle" fill="#000" stroke="none">${mot}</text>`;
  };
  // Lignes de texte figurées par des traits, de largeurs données, à partir de (x, y).
  const lignes = (x, y, largeurs, pas = 4) =>
    largeurs.map((w, i) => `<path d="M${x} ${y + i * pas}h${w}"/>`).join("");
  // Moniteur mural ou de terminal : boîtier et écran.
  const moniteur = (x, y, w, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="#fff"/><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" fill="#fff" stroke-width="0.8"/>`;
  // Personne assise, vue de dos : tête et épaules, coupées par le bas du cadre.
  const dos = (x, y, r) =>
    `<path d="M${x - 2.2 * r} 82q0-${1.7 * r} ${2.2 * r}-${1.7 * r}q${2.2 * r} 0 ${2.2 * r} ${1.7 * r}z" fill="#fff"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`;
  // L'instructeur debout, de face, ses fiches de protocole à la main ; `x` est l'axe du corps.
  const instructeur = (x, y) => `
    <path d="M${x - 7} ${y + 8}q7-3 14 0l3 24h-20z" fill="#fff"/>
    <path d="M${x - 4} ${y + 32}v18M${x + 5} ${y + 32}v18"/>
    <circle cx="${x}" cy="${y}" r="5.5" fill="#fff"/>
    <path d="M${x - 4} ${y + 14}l-7 5"/>
    <g transform="rotate(-8 ${x - 13} ${y + 20})"><rect x="${x - 17}" y="${y + 14}" width="9" height="12" fill="#fff" stroke-width="0.9"/>${lignes(x - 15, y + 17.5, [5, 5, 3], 2.6)}</g>`;
  // Tampon à deux cadres, de travers, avec son libellé.
  const tampon = (cx, cy, w, mot) => `
    <g transform="rotate(-8 ${cx} ${cy})">
      <rect x="${cx - w / 2}" y="${cy - 6}" width="${w}" height="12" rx="1" stroke-width="1.4" fill="#fff"/>
      <rect x="${cx - w / 2 + 2}" y="${cy - 4}" width="${w - 4}" height="8" stroke-width="0.6"/>
      ${texte(cx, cy + 1.8, mot, 4.8, w - 8)}
    </g>`;
  // Doigt posé sur un écran : capsule blanche cernée de noir, de la pulpe (x1, y1) vers la main (x2, y2).
  const doigt = (x1, y1, x2, y2) =>
    `<path d="M${x1} ${y1}L${x2} ${y2}" stroke-width="12"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#fff" stroke-width="9.6"/>`;

  // Sixième sens, étape 1 : le moniteur d'accueil de la salle B-7, quatre agents assis, l'instructeur à côté.
  function bienvenue(label) {
    return vignette(`
      <path d="M0 62H160" stroke-width="0.8"/>
      ${moniteur(34, 6, 92, 42)}
      ${texte(80, 21, label, 5.2, 84)}
      <g stroke-width="1.4">${lignes(42, 28, [60, 72, 48, 66], 4.6)}</g>
      <rect x="110" y="40.3" width="3" height="3.4" fill="#000" stroke="none"/>
      ${instructeur(143, 26)}
      ${[44, 68, 92, 116].map(x => dos(x, 66, 6)).join("")}`);
  }

  // Les quatre moniteurs de règles (départ, déplacements, fermeture, fin), le bandeau du bas, l'instructeur et sa baguette.
  function moniteurs(label) {
    const pictos = [
      x => `<rect x="${x + 8}" y="16" width="14" height="10"/><circle cx="${x + 15}" cy="21" r="2.2" fill="#000"/>`,
      x => `<rect x="${x + 4}" y="17.5" width="7" height="7"/><rect x="${x + 19}" y="17.5" width="7" height="7"/><path d="M${x + 11} 21h8m-2.5-2.5l2.5 2.5-2.5 2.5"/>`,
      x => `<rect x="${x + 8}" y="16" width="14" height="10"/><path d="M${x + 8} 16l14 10M${x + 22} 16l-14 10"/>`,
      x => `<path d="M${x + 10} 15v12M${x + 10} 15h11l-3 3 3 3h-11"/>`,
    ];
    const ecrans = pictos.map((picto, i) => {
      const x = 10 + i * 36;
      return `${moniteur(x, 8, 30, 24)}${texte(x + 6, 15, String(i + 1), 4.5)}${picto(x)}`;
    }).join("");
    return vignette(`
      ${ecrans}
      <rect x="10" y="36" width="138" height="8" fill="#fff"/>
      ${texte(79, 41.8, label, 4.6, 130)}
      <path d="M146 58l-14-12"/>
      ${instructeur(150, 50)}
      ${[30, 58, 86].map(x => dos(x, 68, 6)).join("")}`);
  }

  // La partie : le plan sur la tablette (deux rangées de salles), le pion, deux salles fermées, la carte W.Y.C.,
  // le doigt du Coordinateur qui touche la salle à fermer.
  function plan() {
    const id = `s${++uid}`;
    const salles = [[40, 12], [62, 12], [84, 12], [106, 12], [40, 46], [62, 46], [84, 46], [106, 46]];
    const fermees = [[40, 12], [106, 46]];
    return vignette(`
      ${hachures(id)}
      <g transform="rotate(-8 14 49)"><rect x="4" y="34" width="20" height="30" rx="2" fill="#fff"/>${texte(14, 41, "W.Y.C.", 3.6)}${texte(14, 57, "2", 12)}</g>
      <rect x="30" y="4" width="102" height="72" rx="4" fill="#fff"/>
      <rect x="34" y="8" width="94" height="64" fill="#fff" stroke-width="0.8"/>
      <path d="M40 36H122" stroke-width="1"/>
      ${salles.map(([x, y]) => `<path d="M${x + 8} ${y < 36 ? 28 : 36}v${y < 36 ? 8 : 10}" stroke-width="0.8"/>`).join("")}
      ${salles.map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="16" fill="#fff"/>`).join("")}
      ${fermees.map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="16" fill="url(#${id})"/><path d="M${x} ${y}l16 16M${x + 16} ${y}l-16 16" stroke-width="1.6"/>`).join("")}
      <circle cx="70" cy="54" r="6" fill="#fff"/><circle cx="70" cy="54" r="3.5" fill="#000"/>
      <ellipse cx="132" cy="74" rx="26" ry="14" fill="#fff" transform="rotate(-20 132 74)"/>
      <path d="M110 70a5 5 0 0 1 8-4M118 66a5 5 0 0 1 8-3M126 63a5 5 0 0 1 8-2" stroke-width="0.9"/>
      ${doigt(92, 22, 114, 54)}`);
  }

  // Le rapport de fin sur la tablette, son tampon ; la fiche de protocole cochée et le micro du Coordinateur.
  function rapport(label) {
    const cases = [0, 1, 2, 3, 4, 5, 6].map(k => {
      const y = 35 + k * 4.4;
      return `<rect x="11" y="${y}" width="3" height="3" stroke-width="0.7"/>${k < 3 ? `<path d="M11 ${y}l3 3m0-3l-3 3" stroke-width="0.7"/>` : ""}<path d="M17 ${y + 1.5}h16" stroke-width="0.8"/>`;
    }).join("");
    return vignette(`
      <g transform="rotate(6 22 50)"><rect x="6" y="24" width="32" height="44" fill="#fff"/><path d="M11 30h16" stroke-width="1.6"/>${cases}</g>
      <rect x="52" y="2" width="56" height="80" rx="4" fill="#fff"/>
      <rect x="56" y="6" width="48" height="74" fill="#fff" stroke-width="0.8"/>
      <path d="M61 12h20" stroke-width="1.6"/><path d="M61 16h30" stroke-width="0.8"/>
      <rect x="61" y="21" width="38" height="4" fill="#000" stroke="none"/>
      <g stroke-width="0.9">${lignes(61, 31, [38, 34, 38, 30, 38, 36, 24], 4)}</g>
      ${tampon(80, 68, 54, label)}
      <path d="M128 32a8 8 0 0 0 16 0M136 40v30"/>
      <ellipse cx="136" cy="71" rx="9" ry="2.5" fill="#fff"/>
      <rect x="130" y="14" width="12" height="22" rx="6" fill="#fff"/>
      <path d="M133 20h6M133 24h6M133 28h6" stroke-width="0.8"/>`);
  }

  // Une simple formalité, étape 1 : Kessler sourit derrière son bureau ; la tablette affiche le salaire.
  function accueil(label) {
    const id = `s${++uid}`;
    return vignette(`
      ${hachures(id, 30)}
      <rect x="10" y="6" width="36" height="22" fill="#fff"/>
      ${texte(28, 16, "WEYLAND-YUTANI", 3.2)}${texte(28, 22, "CORP", 3.2)}
      <path d="M78 62q1-16 16-20l6 6 6-6q15 4 16 20z" fill="#fff"/>
      <path d="M96 42l4 10 4-10"/>
      <rect x="84" y="50" width="8" height="5" fill="#fff" stroke-width="0.8"/><path d="M85.5 52.5h5" stroke-width="0.6"/>
      <circle cx="100" cy="30" r="10" fill="#fff"/>
      <path d="M90 28q1-12 10-12t10 12q-4-5-10-4q-6-1-10 4z" fill="url(#${id})"/>
      <circle cx="96.5" cy="30.5" r="0.9" fill="#000"/><circle cx="103.5" cy="30.5" r="0.9" fill="#000"/>
      <path d="M95.5 34.5q4.5 4 9 0"/>
      <path d="M8 62H152" stroke-width="1.6"/><path d="M14 62v18M146 62v18"/>
      <rect x="24" y="44" width="40" height="16" rx="2" fill="#fff"/><path d="M44 60v2M38 62h12" stroke-width="0.9"/>
      ${texte(44, 53, "48 000", 5.6)}<path d="M30 56.5h28" stroke-width="0.7"/>
      <rect x="112" y="54" width="24" height="8" fill="#fff"/>${texte(124, 59.8, label, 4.6, 20)}`);
  }

  // Étapes 2 et 3 : le contrat qui défile (barres noires, ascenseur en bas de course), le lecteur d'empreinte,
  // le doigt qui reste posé, la jauge d'analyse.
  function contrat(label) {
    return vignette(`
      <rect x="44" y="2" width="72" height="80" rx="4" fill="#fff"/>
      <rect x="48" y="6" width="64" height="72" fill="#fff" stroke-width="0.8"/>
      <rect x="54" y="10" width="30" height="3" fill="#000" stroke="none"/>
      <g stroke-width="0.9">${lignes(54, 17, [46, 50, 38, 50, 44, 30], 4)}</g>
      <rect x="72" y="23.5" width="20" height="3" fill="#000" stroke="none"/><rect x="54" y="31.5" width="16" height="3" fill="#000" stroke="none"/>
      <path d="M107 10v30" stroke-width="0.8"/><rect x="105.8" y="31" width="2.4" height="9" fill="#000" stroke="none"/>
      <rect x="54" y="44" width="52" height="30" rx="2.5" fill="#fff"/>
      <g stroke-width="1"><path d="M70 60a2 2.6 0 1 1 4 0M67.5 61.5a4.5 5.5 0 1 1 9 0M65 63a7 8.5 0 1 1 14 0M62.5 64.5a9.5 11.5 0 1 1 19 0"/></g>
      <rect x="58" y="67" width="44" height="4.5" stroke-width="0.8"/><rect x="58" y="67" width="26" height="4.5" fill="#000" stroke="none"/>
      ${texte(66, 77.6, label, 4.4)}
      ${doigt(86, 60, 124, 94)}`);
  }

  // Session disciplinaire, étape 1 : le terminal du Coordinateur resté allumé, la chaise reculée, l'e-mail tamponné.
  function intercepte(label) {
    return vignette(`
      <path d="M36 60H156" stroke-width="1.6"/><path d="M44 60v20M148 60v20"/>
      <rect x="8" y="28" width="22" height="26" rx="3" fill="#fff"/><rect x="4" y="54" width="30" height="4" fill="#fff"/><path d="M8 58v22M30 58v22"/>
      <path d="M58 6l-3-3M150 6l3-3M58 56l-3 3M150 56l3 3" stroke-width="0.9"/>
      <rect x="90" y="57" width="24" height="3" fill="#fff"/><path d="M102 54v3"/>
      ${moniteur(62, 8, 84, 46)}
      <path d="M70 17h14" stroke-width="1.6"/><g stroke-width="0.9">${lignes(70, 21, [30, 22], 4)}</g><path d="M70 29h68" stroke-width="0.5"/>
      <g stroke-width="0.9">${lignes(70, 33, [60, 66, 52, 40], 4)}</g>
      <rect x="112" y="43.4" width="3" height="3.2" fill="#000" stroke="none"/>
      ${tampon(104, 34, 52, label)}
      <rect x="72" y="55.5" width="16" height="4.5" rx="1" fill="#fff"/><path d="M75 57.8h10" stroke-width="0.5"/>
      <rect x="124" y="52" width="8" height="8" rx="1" fill="#fff"/><path d="M132 54a2.5 2.5 0 0 1 0 5"/>`);
  }

  // Étape 2 : D.R. de dos devant son propre message tamponné ; sa fiole de NS-X III barrée ; l'instructeur derrière lui.
  function decouvert(label) {
    return vignette(`
      <path d="M10 58H120" stroke-width="1.6"/>
      <rect x="50" y="55" width="20" height="3" fill="#fff"/><path d="M60 48v7"/>
      ${moniteur(26, 8, 68, 40)}
      <path d="M34 17h12" stroke-width="1.6"/><path d="M34 21h24" stroke-width="0.9"/>
      <g stroke-width="0.9">${lignes(34, 27, [50, 44, 52, 30], 4)}</g>
      ${tampon(60, 31, 44, label)}
      <path d="M38 82q0-22 22-22t22 22z" fill="#fff"/>
      <circle cx="60" cy="52" r="10" fill="#fff"/>
      <rect x="104" y="42" width="8" height="14" rx="1.5" fill="#fff"/><rect x="105.5" y="39" width="5" height="3" fill="#000" stroke="none"/>
      <path d="M101 40l14 18M115 40l-14 18"/>
      ${texte(108, 64, "NS-X III", 3.4)}
      ${instructeur(140, 22)}`);
  }

  const DESSINS = { bienvenue, moniteurs, plan, rapport, accueil, contrat, intercepte, decouvert };

  for (const el of document.querySelectorAll("[data-illu]")) el.innerHTML = DESSINS[el.dataset.illu](el.dataset.label ?? "");
})();
