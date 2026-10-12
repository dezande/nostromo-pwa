import { Icon } from "./Icon";
import { settingsOpen } from "../state/ui";

export function Header() {
  return (
    <header class="top-bar">
      <h1>NOSTROMO II <small>· TRAINING BASE</small></h1>
      <button class="icon-btn" id="setBtn" aria-label="Réglages" title="Réglages" onClick={() => { settingsOpen.value = true; }}>
        <Icon name="gear" /><span class="lbl">Réglages</span>
      </button>
    </header>
  );
}
