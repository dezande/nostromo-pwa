// Faux écran de transition : terminal MU/TH/UR 6000.
import { useEffect } from "preact/hooks";
import { Overlay } from "../components/Overlay";
import { WeylandLogo } from "../components/WeylandLogo";
import { terminal, terminalOpen, skipTerminal } from "../state/terminal";

export function Transition() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (terminalOpen.value && [" ", "Enter", "Escape"].includes(e.key)) { e.preventDefault(); skipTerminal(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const { title, lines, progress } = terminal.value;
  return (
    <Overlay id="trans" show={terminalOpen.value} aria-live="polite" onPointerDown={skipTerminal}>
      <WeylandLogo class="logo-watermark" />
      <div class="term">
        <div class="hd" id="transHd">{title}</div>
        <div id="transLines">
          {lines.map((line, i) => (
            <div key={i} class="ln">
              <span class={line.done ? "" : "cur"}>{line.typed}</span>
              {line.result && line.typed === line.text && <span class="dots" />}
              {line.result && line.showResult && <span class={`res ${line.warn ? "warn" : "ok"}`}>{line.result}</span>}
            </div>
          ))}
        </div>
        <div class="bar"><i id="transBar" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
        <div class="skip">TOUCHEZ POUR PASSER</div>
      </div>
    </Overlay>
  );
}
