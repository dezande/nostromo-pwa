// Icônes et dessins des fiches de prétirés, en traits noirs (SVG), insérés au chargement :
//   <i class="ic" data-ic="nom"></i>                 icône (liste dans ICONES)
//   <span class="die" data-face="3" data-hit></span>  dé à six faces ; data-hit : dé noirci (succès)
//   <span class="rank" data-rank="2"></span>         rang de maîtrise, 3 cases dont 2 noircies
//   <span class="track" data-n="6"></span>           cases de points d'énergie à cocher
//   <span class="barcode" data-code="…"></span>      code-barres tiré du texte
//   <div class="illu" data-illu="horizon|oeuf"></div>
(() => {
  const ICONES = {
    physique: '<path d="M2 12h20M5 8.5v7M8 6v12M16 6v12M19 8.5v7"/>',
    mental: '<path d="M14 21v-3h2.5a2 2 0 0 0 2-2v-2.5l2-.8-2-3.7A7.5 7.5 0 1 0 7 15.5V21"/><circle cx="11.5" cy="9.5" r="2"/><path d="M11.5 5v2.5M11.5 11.5V14M7 9.5h2.5M13.5 9.5H16"/>',
    social: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-4 2.7-6 6-6s6 2 6 6M14.5 14.6c.8-.4 1.6-.6 2.5-.6 3 0 5 2 5 5"/>',
    pe: '<path d="M12 20.5S3.5 15.4 3.5 9A4.5 4.5 0 0 1 12 6.6 4.5 4.5 0 0 1 20.5 9c0 6.4-8.5 11.5-8.5 11.5z"/><path d="M5 11.5h3.5L10 8.5l2.2 6 1.6-3h4.4"/>',
    atout: '<path d="M12 2.8l2.7 5.7 6.2.8-4.6 4.2 1.2 6.2L12 16.6l-5.5 3.1 1.2-6.2-4.6-4.2 6.2-.8z"/>',
    defaut: '<path d="M12 3L2 20.5h20z"/><path d="M12 9.5v5M12 17.2v.3"/>',
    cible: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5"/>',
    badge: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 16.5c.6-1.6 1.9-2.3 3.5-2.3s2.9.7 3.5 2.3M14.5 10h4M14.5 13h4M10 5V3h4v2"/>',
    dossier: '<path d="M6 2h9l4 4v16H6z"/><path d="M15 2v4h4M9 11h7M9 14h7M9 17h5"/>',
    sac: '<rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M9 8V5h6v3M3 13h18M11 12v3h2v-3"/>',
    de: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="16" cy="16" r="1.3" fill="currentColor"/>',
    crayon: '<path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19z"/><path d="M14 7l3.5 3.5M4 20h16"/>',
    lieu: '<path d="M12 22s7-6.6 7-12a7 7 0 0 0-14 0c0 5.4 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    homme: '<circle cx="10" cy="14" r="6"/><path d="M14.3 9.7L21 3M15 3h6v6"/>',
    femme: '<circle cx="12" cy="9" r="6"/><path d="M12 15v7M8.5 19h7"/>',
    oeil: '<path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    secret: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.2 0 10 7 10 7a17 17 0 0 1-3 3.8M6.6 6.6C3.7 8.4 2 12 2 12s3.8 7 10 7c1.8 0 3.4-.6 4.7-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    cadenas: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="1.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5M12 14.5v3"/>',
    bulle: '<path d="M3.5 4.5h17v11.5H10l-5 4v-4H3.5z"/><path d="M8 9h8M8 12h5"/>',
    liste: '<path d="M10 6h11M10 12h11M10 18h11"/><path d="M3 6l1.5 1.5L7.5 4.5M3 12l1.5 1.5 3-3M3 18l1.5 1.5 3-3"/>',
    crane: '<path d="M5 15.5V10a7 7 0 0 1 14 0v5.5l-2 1.2V21H7v-4.3z"/><circle cx="9" cy="11.5" r="1.8"/><circle cx="15" cy="11.5" r="1.8"/><path d="M12 14.2l-1 1.6h2zM10 21v-2.5M14 21v-2.5"/>',
    valide: '<circle cx="12" cy="12" r="9.5"/><path d="M7 12.5l3.2 3.2L17 9"/>',
    cle: '<path d="M14.5 3.5a5 5 0 0 0-4.6 7L3 17.4V21h3.6l.9-.9v-2h2v-2h2l1.1-1.1a5 5 0 1 0 1.9-11.5z"/><circle cx="16" cy="8" r="1.4"/>',
    outil: '<path d="M14.7 3.3a5 5 0 0 0-5.3 6.5L3 16.2 7.8 21l6.4-6.4a5 5 0 0 0 6.5-5.3l-3 3-3.4-1-1-3.4z"/>',
    portefeuille: '<path d="M3 7.5h15.5a2 2 0 0 1 2 2V19a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19V6a2 2 0 0 1 2-2h11v3.5"/><path d="M15 12h6v4h-6a2 2 0 0 1 0-4z"/>',
    photo: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="9" cy="9.5" r="2"/><path d="M3 17l5-4.5 4 3.5 3.5-3 5.5 5"/>',
    flamme: '<path d="M12 22c4 0 7-2.8 7-7 0-5-5-7-5-12.5-3 2-5.5 5.5-5.5 9-1-.8-1.8-2-2-3.2-1.2 2-2.5 4.4-2.5 6.7 0 4.2 4 7 8 7z"/><path d="M12 22c-1.8 0-3-1.3-3-3 0-2 3-4 3-6 0 2 3 4 3 6 0 1.7-1.2 3-3 3z"/>',
    lame: '<path d="M3 21l5.5-5.5M8.5 15.5L20.5 3.5c.8 4-1 8-5 11.5l-2 1.5z"/><path d="M6 13l5 5"/>',
    seringue: '<path d="M17.5 2.5l4 4M19.5 4.5l-3 3M16.5 7.5l-9.5 9.5-3-.5-1.5 1.5 3 3 1.5-1.5-.5-3 9.5-9.5zM13.5 6.5l4 4M8 12l2 2M10.5 9.5l2 2"/>',
    film: '<rect x="4" y="2.5" width="16" height="19" rx="1"/><path d="M8 2.5v19M16 2.5v19M4 6.5h4M4 10.5h4M4 14.5h4M4 18.5h4M16 6.5h4M16 10.5h4M16 14.5h4M16 18.5h4"/>',
    radio: '<rect x="5" y="9" width="14" height="12" rx="1.5"/><path d="M8 9l8-6.5M8.5 13h7M8.5 17h2.5"/><circle cx="15" cy="17" r="1.5"/>',
    montre: '<rect x="6.5" y="7" width="11" height="10" rx="2"/><path d="M9 7V3h6v4M9 17v4h6v-4M8.5 12h2l1-2 1.5 4 1-2h1.5"/>',
    lampe: '<path d="M3 9.5h9.5l4.5-3.5v12l-4.5-3.5H3z"/><path d="M19.5 8.5l2-1M19.5 12h2.5M19.5 15.5l2 1"/>',
    ration: '<path d="M6 6.5c0-1.4 2.7-2.5 6-2.5s6 1.1 6 2.5v11c0 1.4-2.7 2.5-6 2.5s-6-1.1-6-2.5z"/><path d="M6 6.5C6 7.9 8.7 9 12 9s6-1.1 6-2.5M6 15c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5"/>',
    tenue: '<path d="M8.5 3L3 6.2l2 4.3 2.2-1V21h9.6V9.5l2.2 1 2-4.3L15.5 3c0 2-1.6 3.4-3.5 3.4S8.5 5 8.5 3z"/>',
    puce: '<rect x="6" y="6" width="12" height="12" rx="1"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    courrier: '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M3 6l9 7 9-7"/>',
    ciseaux: '<circle cx="6" cy="6.5" r="3"/><circle cx="6" cy="17.5" r="3"/><path d="M8.6 8L21 18M8.6 16L21 6"/>',
    micro: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
    plan: '<path d="M3 6l6-2.5 6 2.5 6-2.5v15l-6 2.5-6-2.5-6 2.5z"/><path d="M9 3.5v15M15 6v15"/>',
    protocole: '<rect x="5" y="4" width="14" height="17.5" rx="1.5"/><path d="M9 4V2.5h6V4M8.5 9.5h7M8.5 13h7M8.5 16.5h4"/>',
    sas: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="5.5"/><path d="M12 6.5v11M6.5 12h11"/>',
    horloge: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2.5"/>',
    epee: '<path d="M14.5 3.5H20.5V9.5L9 21 3 15z"/><path d="M6 12l6 6"/>',
    ondes: '<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>',
    alien: '<path d="M4 9c0-3.5 4-6 9.5-6 4 0 7.5 1.3 7.5 3.5 0 3-3.5 4.5-6.5 5l-1 2.5h-3L10 21l-1.5-4.5L6 14c-1.4-1.2-2-3-2-5z"/><path d="M8 15h2M11 15.5h1.5M7.5 8c2-1.5 6-2 9-1"/>',
    fleche: '<path d="M4 12h15M14 6.5l5.5 5.5-5.5 5.5"/>',
  };

  const SVG = 'xmlns="http://www.w3.org/2000/svg"';
  const trait = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  let uid = 0;

  // Dé « à traits », comme dans le tutoriel de l'app (src/screens/Tutorial.tsx) : de 1 à 3 traits horizontaux,
  // puis pour 4 à 6, trois traits horizontaux raccourcis et 1 à 3 traits verticaux. Repère de 0 à 1.
  const LIGNES = { 1: [.5], 2: [.38, .62], 3: [.3, .5, .7] };
  const COLONNES = { 1: [.7], 2: [.63, .77], 3: [.57, .695, .82] };
  const T = .075; // épaisseur d'un trait
  function de(face, noirci) {
    const large = face <= 3 ? .6 : .3, gauche = face <= 3 ? .2 : .16;
    const traits = [
      ...LIGNES[Math.min(face, 3)].map(y => [gauche, y - T / 2, large, T]),
      ...(COLONNES[face - 3] ?? []).map(x => [x - T / 2, .2, T, .6]),
    ].map(([x, y, w, h]) => `<rect x="${x * 24}" y="${y * 24}" width="${w * 24}" height="${h * 24}" rx="0.7"/>`).join("");
    const fond = noirci ? "#000" : "#fff", encre = noirci ? "#fff" : "#000";
    return `<svg ${SVG} viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="4.3" fill="${fond}" stroke="#000" stroke-width="1.6"/><g fill="${encre}">${traits}</g></svg>`;
  }

  function codeBarres(texte) {
    let x = 0, barres = "";
    for (const c of `*${texte}*`) {
      const n = c.charCodeAt(0);
      for (let k = 0; k < 4; k++) {
        const w = ((n >> k) & 1) + 1 + (k === 0 ? 1 : 0) * ((n >> 4) & 1);
        if (k % 2 === 0) barres += `<rect x="${x}" y="0" width="${w}" height="20"/>`;
        x += w;
      }
      x += 1;
    }
    return `<svg ${SVG} viewBox="0 0 ${x} 20" preserveAspectRatio="none">${barres}</svg>`;
  }

  // Bas de page : horizon lunaire, base Nostromo II, vaisseau et planète.
  function horizon() {
    const id = `h${++uid}`;
    const etoiles = [[18, 8], [52, 18], [88, 6], [130, 14], [168, 4], [214, 20], [246, 9], [292, 16], [318, 5], [356, 12], [384, 22], [8, 26], [150, 26], [270, 27]]
      .map(([x, y], i) => i % 3 === 0
        ? `<path d="M${x - 2.5} ${y}h5M${x} ${y - 2.5}v5" stroke="#000" stroke-width="0.8"/>`
        : `<circle cx="${x}" cy="${y}" r="0.8"/>`).join("");
    return `<svg ${SVG} viewBox="0 0 400 54">
      <defs><pattern id="${id}" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0v2.4" stroke="#000" stroke-width="0.7"/></pattern></defs>
      <g fill="#000">${etoiles}</g>
      <g transform="translate(340 16)"><circle r="11" fill="#fff" stroke="#000" stroke-width="1.2"/><path d="M-11 0a11 11 0 0 0 22 0z" fill="url(#${id})"/><ellipse rx="19" ry="4" fill="none" stroke="#000" stroke-width="1.1" transform="rotate(-14)"/></g>
      <g transform="translate(60 12)" stroke="#000" stroke-width="0.9" fill="#fff">
        <path d="M0 6h14l4-4h40l6 4h22v6H64l-6 3H18l-4-3H0z"/>
        <path d="M18 2v13M58 2v13M30 5h20M30 9h20M26 15v3h8v-3M44 15v3h8v-3"/>
        <path d="M86 7l10-2v8l-10-1z" fill="#000"/>
        <path d="M-1 9h-10M-1 7h-6M-1 11h-6" stroke-dasharray="2 1.5"/>
      </g>
      <path d="M0 42c20-4 40-3 64-1s38-6 60-6 40 6 70 5 50-7 80-7 44 5 64 4 42-3 62-1v18H0z" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <g fill="none" stroke="#000" stroke-width="0.8"><ellipse cx="34" cy="47" rx="9" ry="2"/><ellipse cx="300" cy="46" rx="12" ry="2.4"/><ellipse cx="372" cy="49" rx="6" ry="1.4"/><path d="M20 50h28M285 51h32"/></g>
      <g stroke="#000" stroke-width="1.1">
        <path d="M150 37a14 14 0 0 1 28 0z" fill="url(#${id})"/><path d="M150 37a14 14 0 0 1 28 0" fill="none"/>
        <path d="M182 38a9 9 0 0 1 18 0z" fill="#fff"/>
        <path d="M128 39h22M178 38h4M200 38h26" fill="none"/>
        <rect x="204" y="27" width="22" height="11" fill="#fff"/><path d="M207 31h4M214 31h4M221 31h2" fill="none"/>
        <path d="M232 38V14M228 38l4-12 4 12M226 18h12" fill="none"/><circle cx="232" cy="12" r="1.6" fill="#000"/>
        <path d="M105 40h22l-3 -3h-16z" fill="#fff"/><path d="M116 37v-6l-4-3h8l-4 3" fill="none"/>
      </g>
      <text x="164" y="52" font-family="IBM Plex Mono, monospace" font-size="5" text-anchor="middle" letter-spacing="0.6">NOSTROMO II</text>
    </svg>`;
  }

  // Page du MJ : œuf xénomorphe gravé, posé dans la brume.
  function oeuf() {
    const id = `h${++uid}`;
    return `<svg ${SVG} viewBox="0 0 64 84">
      <defs><pattern id="${id}" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0v2.2" stroke="#000" stroke-width="0.8"/></pattern></defs>
      <path d="M32 8c15 0 24 22 24 42 0 18-10 26-24 26S8 68 8 50C8 30 17 8 32 8z" fill="#fff" stroke="#000" stroke-width="1.8"/>
      <path d="M44 16c8 10 12 22 12 34 0 18-10 26-24 26 10-4 18-12 18-28 0-12-2-22-6-32z" fill="url(#${id})"/>
      <g fill="none" stroke="#000" stroke-width="1.1" stroke-linecap="round">
        <path d="M32 21c-4 2-8 2-11 0M32 21c4 2 8 2 11 0M32 21c-2-4-2-8 0-11M32 21c2 4 2 8 0 11"/>
        <path d="M21 21c-2 4-1 8 2 11M43 21c2 4 1 8-2 11M23 32c3 3 6 3 9 0 3 3 6 3 9 0"/>
        <path d="M16 44c2 10 1 18-2 24M22 40c1 12 0 22-2 32M42 40c-1 12 0 22 2 32M48 44c-2 10-1 18 2 24"/>
      </g>
      <g fill="none" stroke="#000" stroke-width="0.9" stroke-linecap="round"><path d="M2 76c6-2 10 2 16 0s10-2 16 0 10 2 16 0 9-2 12 0M6 81c6-2 10 2 16 0s10-2 16 0 10 2 16 0"/></g>
    </svg>`;
  }

  const DESSINS = { horizon, oeuf };

  // Version femme du prétiré : les pages .joueur sont recopiées juste après, avec les textes de data-f
  // (accords au féminin). La page d'aide du MJ reste unique, à la fin.
  const joueur = [...document.querySelectorAll(".page.joueur")];
  if (joueur.length) {
    let apres = joueur.at(-1);
    for (const page of joueur) {
      const copie = page.cloneNode(true);
      copie.classList.add("femme");
      for (const el of copie.querySelectorAll("[data-f]")) el.innerHTML = el.dataset.f;
      apres.after(copie);
      apres = copie;
    }
  }

  for (const el of document.querySelectorAll("[data-ic]")) {
    el.innerHTML = `<svg ${SVG} viewBox="0 0 24 24" ${trait}>${ICONES[el.dataset.ic] ?? ""}</svg>`;
  }
  for (const el of document.querySelectorAll(".die")) el.innerHTML = de(+el.dataset.face, el.hasAttribute("data-hit"));
  for (const el of document.querySelectorAll(".rank[data-rank]")) {
    el.innerHTML = [1, 2, 3].map(k => `<i${k <= +el.dataset.rank ? ' class="on"' : ""}></i>`).join("");
  }
  for (const el of document.querySelectorAll(".track")) el.innerHTML = "<i></i>".repeat(+el.dataset.n);
  for (const el of document.querySelectorAll(".barcode")) el.innerHTML = codeBarres(el.dataset.code);
  for (const el of document.querySelectorAll("[data-illu]")) el.innerHTML = DESSINS[el.dataset.illu](el.dataset.variant);
})();
