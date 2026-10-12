import { useEffect, useRef, useState } from "preact/hooks";

/**
 * Action en deux temps : le premier appui « arme » le bouton pendant 3 s, le second confirme.
 * Si `needed` est faux, l'action est faite tout de suite.
 */
export function useConfirm() {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const run = (needed: boolean, action: () => void) => {
    if (needed && !armed) {
      setArmed(true);
      timer.current = setTimeout(() => setArmed(false), 3000);
      return;
    }
    clearTimeout(timer.current);
    setArmed(false);
    action();
  };
  return [armed, run] as const;
}
