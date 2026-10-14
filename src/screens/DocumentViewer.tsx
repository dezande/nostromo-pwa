// Liseuse des documents d'un scénario (fiches, guide du MJ) : le texte des pages HTML d'où sont tirés
// les PDF (dossier fiches/), remis en forme au style de l'app, sans pages A4.
import { useEffect, useState } from "preact/hooks";
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { openDocument, type ScenarioDocument } from "../state/ui";

/**
 * Ce qui ne sert qu'à l'impression : en-têtes et pieds de page, logo, sommaire avec numéros de page,
 * icônes, dessins et code-barres des prétirés (tracés par fiches/pretire.js).
 */
const PRINT_ONLY = "header.header, footer.footer, img, .dots, .box:has(.toc), .ic, .illu, .barcode, .notes";

/** Caractéristiques d'un prétiré, lisibles à l'écran : comment s'en servir, jauge sur 5, cases de PE. */
function explainTraits(doc: Document) {
  doc.querySelectorAll(".traits").forEach(traits => {
    const help = doc.createElement("p");
    help.className = "traits-help";
    help.innerHTML = "Pour un test, lancez <b>3 dés</b> : chaque dé <b>inférieur ou égal</b> à la caractéristique testée compte pour <b>1 succès</b>.";
    traits.before(help);
  });
  doc.querySelectorAll<HTMLElement>(".trait .t-val").forEach(val => {
    const n = Number(val.textContent);
    const pips = doc.createElement("span");
    pips.className = "t-pips";
    pips.setAttribute("aria-label", `${n} sur 5`);
    pips.innerHTML = Array.from({ length: 5 }, (_, i) => `<i${i < n ? ' class="on"' : ""}></i>`).join("");
    val.after(pips);
  });
  doc.querySelectorAll<HTMLElement>(".t-hint").forEach(hint => { hint.textContent = hint.textContent!.replace(/^dé ≤ (\d) = succès$/, "succès : 1–$1"); });
  doc.querySelectorAll<HTMLElement>(".energy .track").forEach(track => { track.innerHTML = "<i></i>".repeat(Number(track.dataset.n)); });
}

/** Garde le contenu des pages A4 choisies, sans la mise en page imprimée ; au féminin si demandé (data-f). */
export function documentText(html: string, { pages = ".page", feminine = false }: Pick<ScenarioDocument, "pages" | "feminine"> = {}): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (feminine) doc.querySelectorAll<HTMLElement>("[data-f]").forEach(el => { el.innerHTML = el.dataset.f!; });
  // Seules icônes gardées : le symbole du sexe, en texte (U+FE0E : pas d'emoji)
  doc.querySelectorAll<HTMLElement>(".ic[data-ic=homme], .ic[data-ic=femme]").forEach(el => {
    el.replaceWith(Object.assign(doc.createElement("span"), { className: "sex", textContent: el.dataset.ic === "femme" ? "♀︎" : "♂︎" }));
  });
  doc.querySelectorAll(PRINT_ONLY).forEach(el => el.remove());
  explainTraits(doc);
  doc.querySelectorAll(".title .sub").forEach(el => { if (/PAGE \d/.test(el.textContent || "")) el.remove(); });
  doc.querySelectorAll("[style]").forEach(el => el.removeAttribute("style")); // tailles en mm
  return [...doc.querySelectorAll(pages)].map(page => page.innerHTML).join("");
}

export function DocumentViewer() {
  const doc = openDocument.value;
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setText(null);
    setFailed(false);
    if (!doc) return;
    let current = true;
    fetch(`fiches/${doc.html}`)
      .then(res => { if (!res.ok) throw new Error(String(res.status)); return res.text(); })
      .then(html => { if (current) setText(documentText(html, doc)); })
      .catch(() => { if (current) setFailed(true); });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") openDocument.value = null; };
    addEventListener("keydown", onKey);
    return () => { current = false; removeEventListener("keydown", onKey); };
  }, [doc]);

  return (
    <Overlay id="docViewer" show={!!doc} role="dialog" aria-modal="true" aria-labelledby="docTitle">
      {doc && (
        <div class="panel doc-panel">
          <div class="doc-head">
            <h2 id="docTitle">{doc.name}</h2>
            <a class="sheet-link sheet-pdf" id="docPdf" href={`fiches/${doc.file}`} target="_blank" rel="noopener"
              download={doc.file} aria-label={`${doc.name} en PDF`}>PDF</a>
            <IconButton id="docClose" icon="annuler" label="Fermer" onClick={() => { openDocument.value = null; }} />
          </div>
          {text !== null
            ? <article id="docText" class="doc-text" dangerouslySetInnerHTML={{ __html: text }} />
            : <p class="doc-text doc-status">{failed ? "DOCUMENT INDISPONIBLE · UTILISEZ LE PDF" : "CHARGEMENT…"}</p>}
        </div>
      )}
    </Overlay>
  );
}
