import { useEffect, useState } from "preact/hooks";

/** Fait apparaître un texte lettre par lettre, comme sur un terminal. */
export function useTypewriter(text: string, msPerChar = 35): string {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    const timer = setInterval(() => {
      setCount(n => {
        if (n >= text.length) { clearInterval(timer); return n; }
        return n + 1;
      });
    }, msPerChar);
    return () => clearInterval(timer);
  }, [text, msPerChar]);
  return text.slice(0, count);
}
