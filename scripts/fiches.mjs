// Génère les documents imprimables des scénarios « Sixième sens », « Une simple formalité » et « Session disciplinaire » (A4, noir et blanc,
// règles du 3D6 Système de François Cedelle, licence ORC)
// à partir des pages HTML de fiches/, dans public/fiches/ :
//   - le prétiré de chaque scénario (fiches.html : Daniel ou Sofia Reyes ; infiltre.html : Lieutenant D.R. ;
//     psychic-agent.html : Psychic Agent), en trois PDF : la fiche joueur recto verso en version homme
//     (pages 1–2), en version femme (pages 3–4, recopiées par fiches/pretire.js) et l'aide du Superviseur (page 5 et suivante) ;
//     lisibles en A4 comme réduits en A5 (fiches/pretire.css) ;
//   - le guide du Superviseur de chaque scénario, de 2 à 4 pages ;
//   - les cartes des petits rôles des spectateurs (roles.html : IA et Xénomorphes), format poker, 9 par page ;
//   - la version anglaise de chacun (pages suffixées -en, PDF aux noms anglais) ;
//   - les documents du Superviseur (aide, guide) aussi en miroir (suffixe -miroir / -mirrored, même nom que dans
//     src/data/sheets.ts) : posés sur la table, les joueurs en face ne les lisent pas, comme leur texte dans l'app ;
//   - chaque document sauf les cartes aussi en A5, deux pages par feuille A4 paysage à imprimer recto verso
//     (retournée sur le bord court) : le guide en livret (-livret / -booklet : une feuille pliée en deux, pages
//     dans l'ordre de lecture), les prétirés et l'aide en deux exemplaires par feuille (-a5 : recto = page 1
//     deux fois, verso = page 2 deux fois ; coupée en deux, la feuille donne deux fiches A5 recto verso) ;
//   - le livret complet de chaque scénario (-livret-complet / -full-booklet, et son miroir) : toutes ses feuilles A5
//     en un seul PDF, le guide en livret puis les deux prétirés et l'aide en deux exemplaires, avec un signet par
//     document ; assemblé avec pdf-lib à partir des PDF A5 qui précèdent.
// Le <title> de la page HTML devient le titre du PDF (ou celui de la partie, pour un prétiré).
// Chaque page A4 est un élément .page de hauteur fixe : un contenu qui dépasse fait échouer le script.
// Usage : npm run fiches [-- --png <dossier>]   (--png : enregistre aussi une capture de chaque page et de chaque feuille A5)
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { PDFDocument, PDFHexString, PDFName, PDFNumber } from "pdf-lib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "fiches");
const output = join(root, "public", "fiches");
// Les trois PDF d'un prétiré : version homme, version femme, aide du Superviseur. Tous les PDF d'un scénario
// portent son titre en préfixe (slug), pour qu'ils se rangent ensemble une fois téléchargés.
// a5 : "copies" (deux exemplaires de chaque page par feuille) ou "booklet" (livret).
const pretire = (slug, nom, scenario) => [
  { pdf: `nostromo-${slug}-fiche-homme.pdf`, from: 1, to: 2, title: `Nostromo II — ${nom}, version homme (${scenario})`, a5: "copies" },
  { pdf: `nostromo-${slug}-fiche-femme.pdf`, from: 3, to: 4, title: `Nostromo II — ${nom}, version femme (${scenario})`, a5: "copies" },
  { pdf: `nostromo-${slug}-aide-superviseur.pdf`, from: 5, title: `Nostromo II — Aide du Superviseur (${scenario})`, mirror: true, a5: "copies" },
];
// Les mêmes, pour la version anglaise.
const pregen = (slug, name, scenario) => [
  { pdf: `nostromo-${slug}-sheet-male.pdf`, from: 1, to: 2, title: `Nostromo II — ${name}, male version (${scenario})`, a5: "copies" },
  { pdf: `nostromo-${slug}-sheet-female.pdf`, from: 3, to: 4, title: `Nostromo II — ${name}, female version (${scenario})`, a5: "copies" },
  { pdf: `nostromo-${slug}-supervisor-aid.pdf`, from: 5, title: `Nostromo II — Supervisor Aid (${scenario})`, mirror: true, a5: "copies" },
];
const documents = [
  { html: "fiches.html", pages: [5, 6], parts: pretire("une-simple-formalite", "Reyes", "Une simple formalité") },
  { html: "guide-superviseur.html", pdf: "nostromo-une-simple-formalite-guide-superviseur.pdf", pages: [2, 4], mirror: true, a5: "booklet" },
  { html: "infiltre.html", pages: [5, 6], parts: pretire("session-disciplinaire", "Lieutenant D.R.", "Session disciplinaire") },
  { html: "guide-superviseur-infiltre.html", pdf: "nostromo-session-disciplinaire-guide-superviseur.pdf", pages: [2, 4], mirror: true, a5: "booklet" },
  { html: "psychic-agent.html", pages: [5, 6], parts: pretire("sixieme-sens", "Psychic Agent", "Sixième sens") },
  { html: "guide-superviseur-entrainement.html", pdf: "nostromo-sixieme-sens-guide-superviseur.pdf", pages: [2, 4], mirror: true, a5: "booklet" },
  { html: "roles.html", pdf: "nostromo-cartes-roles.pdf", pages: [2, 2] },
  // Version anglaise : mêmes pages HTML suffixées -en, PDF aux noms anglais.
  { html: "fiches-en.html", pages: [5, 6], parts: pregen("a-mere-formality", "Reyes", "A Mere Formality") },
  { html: "guide-superviseur-en.html", pdf: "nostromo-a-mere-formality-supervisor-guide.pdf", pages: [2, 4], mirror: true, a5: "booklet" },
  { html: "infiltre-en.html", pages: [5, 6], parts: pregen("disciplinary-session", "Lieutenant D.R.", "Disciplinary Session") },
  { html: "guide-superviseur-infiltre-en.html", pdf: "nostromo-disciplinary-session-supervisor-guide.pdf", pages: [2, 4], mirror: true, a5: "booklet" },
  { html: "psychic-agent-en.html", pages: [5, 6], parts: pregen("sixth-sense", "Psychic Agent", "Sixth Sense") },
  { html: "guide-superviseur-entrainement-en.html", pdf: "nostromo-sixth-sense-supervisor-guide.pdf", pages: [2, 4], mirror: true, a5: "booklet" },
  { html: "roles-en.html", pdf: "nostromo-role-cards.pdf", pages: [2, 2] },
];

// Le livret complet de chaque scénario : ses feuilles A5 dans l'ordre d'impression (guide en livret, prétiré homme,
// prétiré femme, aide), par langue. Les noms des parties sont ceux des PDF A5 générés plus haut (après le préfixe du
// scénario) ; en miroir, les parties du Superviseur (guide, aide) sont prises dans leur version miroir.
// Les noms des fichiers sont ceux de src/data/sheets.ts (BOOKLETS).
const BOOKLET = {
  fr: { pdf: slug => `nostromo-${slug}-livret-complet.pdf`, title: name => `Nostromo II — Livret complet (${name})`,
    parts: ["guide-superviseur-livret", "fiche-homme-a5", "fiche-femme-a5", "aide-superviseur-a5"] },
  en: { pdf: slug => `nostromo-${slug}-full-booklet.pdf`, title: name => `Nostromo II — Full booklet (${name})`,
    parts: ["supervisor-guide-booklet", "sheet-male-a5", "sheet-female-a5", "supervisor-aid-a5"] },
};
const scenarios = {
  fr: [["sixieme-sens", "Sixième sens"], ["une-simple-formalite", "Une simple formalité"], ["session-disciplinaire", "Session disciplinaire"]],
  en: [["sixth-sense", "Sixth Sense"], ["a-mere-formality", "A Mere Formality"], ["disciplinary-session", "Disciplinary Session"]],
};

// Suffixes des variantes d'un PDF, dans la langue du document (les mêmes que dans src/data/sheets.ts).
const SUFFIX = {
  fr: { copies: "a5", booklet: "livret", mirror: "miroir" },
  en: { copies: "a5", booklet: "booklet", mirror: "mirrored" },
};
/**
 * Les variantes d'une partie : A4, puis miroir, A5 et A5 miroir selon ce que la partie permet.
 * Chaque variante connaît son nom de fichier, son titre et ce qu'il faut faire à la page pour l'obtenir.
 */
function variants(part, title, en) {
  const suffix = SUFFIX[en ? "en" : "fr"];
  const out = [];
  for (const a5 of part.a5 ? [null, part.a5] : [null]) {
    for (const mirror of part.mirror ? [false, true] : [false]) {
      const tags = [a5 && suffix[a5], mirror && suffix.mirror].filter(Boolean);
      out.push({
        pdf: part.pdf.replace(/\.pdf$/, tags.map(t => `-${t}`).join("") + ".pdf"),
        title: tags.length ? `${title} (${tags.join(", ")})` : title,
        a5, mirror,
      });
    }
  }
  return out;
}

// Feuilles A4 paysage de deux pages réduites en A5 (71 %). En miroir, c'est la feuille entière qui est retournée :
// vue dans un miroir, elle redonne exactement la feuille ordinaire, livret compris.
const IMPOSITION_CSS = `
  html.a5 { --a5: 0.7071; }
  html.a5 .sheet { width: 297mm; height: 210mm; display: flex; overflow: hidden; break-after: page; break-inside: avoid; }
  html.a5 .sheet:last-of-type { break-after: auto; }
  html.a5 .slot { width: 148.5mm; height: 210mm; overflow: hidden; flex: none; }
  html.a5 .sheet .page { transform: scale(var(--a5)); transform-origin: top left; break-after: auto; }
  html.a5.miroir .sheet { transform: scaleX(-1); }
  html.a5.miroir .sheet .page { transform: scale(var(--a5)); }
`;
/**
 * Dans le navigateur : remplace les pages A4 (de from à to) par des feuilles A5.
 * Livret : n pages (complétées à un multiple de 4 par des pages blanches) sur n/4 feuilles, chaque feuille
 * portant au recto [dernière | première] et au verso [deuxième | avant-dernière] de ce qui reste, pour qu'une
 * fois pliées et emboîtées les pages se lisent dans l'ordre. Copies : une feuille par page, la page deux fois.
 */
function impose({ from, to, booklet }) {
  const all = [...document.querySelectorAll(".page")];
  const chosen = all.slice(from - 1, to);
  all.forEach(p => p.remove());
  const pairs = [];
  if (booklet) {
    const pages = [...chosen];
    while (pages.length % 4) {
      const blank = document.createElement("main");
      blank.className = "page";
      pages.push(blank);
    }
    const n = pages.length;
    for (let s = 0; s < n / 4; s += 1) {
      pairs.push([pages[n - 1 - 2 * s], pages[2 * s]]);
      pairs.push([pages[2 * s + 1], pages[n - 2 - 2 * s]]);
    }
  } else {
    chosen.forEach(p => pairs.push([p, p.cloneNode(true)]));
  }
  for (const pair of pairs) {
    const sheet = document.createElement("section");
    sheet.className = "sheet";
    for (const p of pair) {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.append(p);
      sheet.append(slot);
    }
    document.body.append(sheet);
  }
  document.documentElement.classList.add("a5");
  return pairs.length;
}

const pngIndex = process.argv.indexOf("--png");
const pngDir = pngIndex > -1 ? resolve(process.argv[pngIndex + 1]) : null;

// Chromium de Playwright s'il est installé, sinon le Chrome de la machine.
async function launch() {
  try { return await chromium.launch(); } catch { return chromium.launch({ channel: "chrome" }); }
}

await mkdir(output, { recursive: true });
if (pngDir) await mkdir(pngDir, { recursive: true });

/** Les PDF A5 générés (nom → fichier et titre), pour assembler ensuite les livrets complets. */
const generated = new Map();

const browser = await launch();
try {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.emulateMedia({ media: "print" });
  /** (Re)charge une page HTML de fiches/, avec les styles des variantes (inertes tant que leur classe n'est pas posée). */
  async function open(doc) {
    await page.goto(pathToFileURL(join(source, doc.html)).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // Version miroir : chaque page retournée sur son axe vertical (la mise en page, elle, ne bouge pas)
    await page.addStyleTag({ content: "html.miroir .page { transform: scaleX(-1); }" + IMPOSITION_CSS });
  }
  /** Enregistre le PDF d'une variante : titre, miroir, puis impression (A4 portrait, ou A4 paysage pour les feuilles A5). */
  async function print(version, pageRanges) {
    await page.evaluate(({ title, mirror }) => {
      document.title = title;
      document.documentElement.classList.toggle("miroir", mirror);
    }, version);
    const file = join(output, version.pdf);
    await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, pageRanges });
    return file;
  }

  for (const doc of documents) {
    await open(doc);

    const pages = await page.evaluate(() => [...document.querySelectorAll(".page")]
      .map(el => el.scrollHeight - el.clientHeight));
    const [min, max] = doc.pages;
    if (pages.length < min || pages.length > max) {
      throw new Error(`fiches/${doc.html} : ${pages.length} page(s), attendu de ${min} à ${max}`);
    }
    pages.forEach((depasse, i) => {
      if (depasse > 1) throw new Error(`fiches/${doc.html} : la page ${i + 1} dépasse le format A4 de ${depasse} px`);
    });
    // Cartes (roles.html) : chaque carte garde aussi sa taille fixe.
    const cards = await page.evaluate(() => [...document.querySelectorAll(".card .frame")]
      .map(el => el.scrollHeight - el.clientHeight));
    cards.forEach((depasse, i) => {
      if (depasse > 1) throw new Error(`fiches/${doc.html} : la carte ${i + 1} dépasse de ${depasse} px`);
    });

    const en = doc.html.endsWith("-en.html");
    const parts = doc.parts ?? [{ pdf: doc.pdf, from: 1, mirror: doc.mirror, a5: doc.a5 }];
    for (const part of parts) {
      part.to ??= pages.length;
      part.title ??= await page.title();
      for (const version of variants(part, part.title, en).filter(v => !v.a5)) {
        const file = await print(version, `${part.from}-${part.to}`);
        const n = part.to - part.from + 1;
        console.log(`PDF : ${file} (${n} page${n > 1 ? "s" : ""})`);
      }
    }
    await page.evaluate(() => document.documentElement.classList.remove("miroir"));

    if (pngDir) {
      const elements = await page.$$(".page");
      for (const [i, el] of elements.entries()) {
        const png = join(pngDir, `${doc.html.replace(/\.html$/, "")}-p${i + 1}.png`);
        await el.screenshot({ path: png });
        console.log(`PNG : ${png}`);
      }
    }

    // Feuilles A5 : l'imposition remanie la page, qu'on recharge pour chaque partie.
    for (const part of parts.filter(p => p.a5)) {
      await open(doc);
      await page.addStyleTag({ content: "@page { size: A4 landscape; margin: 0; }" });
      const sheets = await page.evaluate(impose, { from: part.from, to: part.to, booklet: part.a5 === "booklet" });
      for (const version of variants(part, part.title, en).filter(v => v.a5)) {
        const file = await print(version);
        console.log(`PDF : ${file} (${sheets} feuille${sheets > 1 ? "s" : ""} A4 paysage)`);
        generated.set(version.pdf, { file, title: version.title });
      }
      if (pngDir) {
        await page.evaluate(() => document.documentElement.classList.remove("miroir"));
        const elements = await page.$$(".sheet");
        for (const [i, el] of elements.entries()) {
          const png = join(pngDir, `${part.pdf.replace(/\.pdf$/, "")}-${SUFFIX[en ? "en" : "fr"][part.a5]}-f${i + 1}.png`);
          await el.screenshot({ path: png });
          console.log(`PNG : ${png}`);
        }
      }
    }
  }
} finally {
  await browser.close();
}

/**
 * Signets du PDF assemblé : un par document, vers sa première feuille, tous au premier niveau.
 * pdf-lib ne connaît pas les signets : on écrit le dictionnaire /Outlines du PDF à la main (chaîne First/Last,
 * Prev/Next, Parent, Count).
 */
function addOutline(doc, items) {
  const ctx = doc.context;
  const root = ctx.obj({ Type: "Outlines" });
  const rootRef = ctx.register(root);
  const refs = items.map(() => ctx.nextRef());
  items.forEach((item, i) => {
    const dict = ctx.obj({ Title: PDFHexString.fromText(item.title), Parent: rootRef, Dest: [doc.getPage(item.page).ref, "Fit"] });
    if (i > 0) dict.set(PDFName.of("Prev"), refs[i - 1]);
    if (i < items.length - 1) dict.set(PDFName.of("Next"), refs[i + 1]);
    ctx.assign(refs[i], dict);
  });
  root.set(PDFName.of("First"), refs[0]);
  root.set(PDFName.of("Last"), refs[refs.length - 1]);
  root.set(PDFName.of("Count"), PDFNumber.of(items.length));
  doc.catalog.set(PDFName.of("Outlines"), rootRef);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines")); // le lecteur ouvre le panneau des signets
}

/** Titre d'un signet : le titre du PDF sans la marque, le scénario ni le format, « Reyes, version homme ». */
const bookmark = title => title.replace(/^Nostromo II — /, "").replace(/( \([^()]*\))+$/, "");

for (const lang of ["fr", "en"]) {
  const { pdf, title, parts } = BOOKLET[lang];
  for (const [slug, name] of scenarios[lang]) {
    for (const mirror of [false, true]) {
      const doc = await PDFDocument.create();
      doc.setTitle(mirror ? `${title(name)} (${SUFFIX[lang].mirror})` : title(name));
      doc.setLanguage(lang);
      const items = [];
      for (const part of parts) {
        const plain = `nostromo-${slug}-${part}.pdf`;
        const chosen = mirror ? generated.get(plain.replace(/\.pdf$/, `-${SUFFIX[lang].mirror}.pdf`)) ?? generated.get(plain) : generated.get(plain);
        if (!chosen) throw new Error(`livret complet de ${slug} : ${plain} n'a pas été généré`);
        const src = await PDFDocument.load(await readFile(chosen.file));
        items.push({ title: bookmark(chosen.title), page: doc.getPageCount() });
        for (const p of await doc.copyPages(src, src.getPageIndices())) doc.addPage(p);
      }
      addOutline(doc, items);
      const file = join(output, mirror ? pdf(slug).replace(/\.pdf$/, `-${SUFFIX[lang].mirror}.pdf`) : pdf(slug));
      await writeFile(file, await doc.save());
      console.log(`PDF : ${file} (${doc.getPageCount()} pages, ${items.length} signets)`);
    }
  }
}
