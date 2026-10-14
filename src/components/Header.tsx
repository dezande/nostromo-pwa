import { IconButton } from "./Icon";
import { settingsOpen } from "../state/ui";
import { settings } from "../state/settings";
import { tr } from "../i18n";

export function Header() {
  return (
    <header class="top-bar">
      <h1>NOSTROMO II <small>· TRAINING BASE</small></h1>
      <SoundButton />
      <IconButton id="setBtn" icon="reglages" label={tr("Réglages", "Settings")} onClick={() => { settingsOpen.value = true; }} />
    </header>
  );
}

/** Coupe ou remet la musique : même réglage que « Musique » dans l'onglet Audio. */
function SoundButton() {
  const on = settings.music.value;
  return (
    <IconButton id="soundBtn" icon={on ? "son" : "muet"} title={on ? tr("Son", "Sound") : tr("Muet", "Muted")}
      label={on ? tr("Musique activée", "Music on") : tr("Musique coupée", "Music off")} aria-pressed={on}
      onClick={() => { settings.music.value = !on; }} />
  );
}
