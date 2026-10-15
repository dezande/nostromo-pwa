import { useEffect, useState } from "preact/hooks";

/** Durée par lettre imposée par les tests automatiques (window.nostromo.typingMs) ; 0 : le texte s'affiche d'un coup. */
const forcedMs = () => (typeof window === "undefined" ? undefined : window.nostromo?.typingMs);

/** Fait apparaître un texte lettre par lettre, comme sur un terminal. */
export function useTypewriter(text: string, msPerChar = 35): string {
  const ms = forcedMs() ?? msPerChar;
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    if (ms <= 0) return;
    const timer = setInterval(() => {
      setCount(n => {
        if (n >= text.length) { clearInterval(timer); return n; }
        return n + 1;
      });
    }, ms);
    return () => clearInterval(timer);
  }, [text, ms]);
  return ms <= 0 ? text : text.slice(0, count);
}
