// Passages censurés, comme sur un document caviardé : dans un texte, [[…]] devient une barre ███.
// Le texte d'origine n'est pas dans la page : chaque lettre est remplacée par un bloc, les espaces restent
// (la barre peut ainsi passer à la ligne sur un petit écran).
import type { ComponentChildren } from "preact";
import { tr } from "../i18n";

export function Redact({ text }: { text: string }) {
  const parts: ComponentChildren[] = text.split(/\[\[(.+?)\]\]/).map((part, i) =>
    i % 2 === 0 ? part : (
      <span key={i} class="redacted" title={tr("Passage censuré", "Redacted passage")}>{part.replace(/\S/g, "█")}</span>
    ));
  return <>{parts}</>;
}

