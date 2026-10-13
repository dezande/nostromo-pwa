import { IconButton } from "./Icon";
import { settingsOpen } from "../state/ui";
import { settings } from "../state/settings";

export function Header() {
  return (
    <header class="top-bar">
      <h1>NOSTROMO II <small>· TRAINING BASE</small></h1>
      <SoundButton />
      <IconButton id="setBtn" icon="reglages" label="Réglages" onClick={() => { settingsOpen.value = true; }} />
    </header>
  );
}

/** Coupe ou remet la musique : même réglage que « Musique » dans l'onglet Audio. */
function SoundButton() {
  const on = settings.music.value;
  return (
    <IconButton id="soundBtn" icon={on ? "son" : "muet"} title={on ? "Son" : "Muet"}
      label={on ? "Musique activée" : "Musique coupée"} aria-pressed={on}
      onClick={() => { settings.music.value = !on; }} />
  );
}
