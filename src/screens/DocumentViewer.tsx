// Liseuse des documents d'un scénario (fiches, guide du MJ) : le texte des pages HTML d'où sont tirés
// les PDF (dossier fiches/), remis en forme au style de l'app, sans pages A4.
import { useEffect, useState } from "preact/hooks";
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { openDocument } from "../state/ui";

/** Ce qui ne sert qu'à l'impression : en-têtes et pieds de page, logo, sommaire avec numéros de page. */
const PRINT_ONLY = "header.header, footer.footer, img, .dots, .box:has(.toc)";

/** Garde le contenu des pages A4, sans la mise en page imprimée. */
export function documentText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll(PRINT_ONLY).forEach(el => el.remove());
  doc.querySelectorAll(".title .sub").forEach(el => { if (/PAGE \d/.test(el.textContent || "")) el.remove(); });
  doc.querySelectorAll("[style]").forEach(el => el.removeAttribute("style")); // tailles en mm
  return [...doc.querySelectorAll(".page")].map(page => page.innerHTML).join("");
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
      .then(html => { if (current) setText(documentText(html)); })
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
