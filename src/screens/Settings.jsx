// Réglages : audio, affichage, partie, et numéro de build.
import { Overlay } from "../components/Overlay.jsx";
import { THEMES, mix, fontStack } from "../data/themes.js";
import { settings } from "../state/settings.js";
import { settingsOpen } from "../state/ui.js";
import { BUILD, offline } from "../state/pwa.js";

export function Settings() {
  return (
    <Overlay id="settings" show={settingsOpen.value}>
      <div class="panel">
        <h2>RÉGLAGES</h2>

        <div class="set-title">AUDIO</div>
        <Toggle id="musicChk" label="Musique" setting={settings.music} />
        <Slider id="volRange" label="Volume de la musique" setting={settings.musicVolume} min={0} max={100} scale={100} unit="%" />
        <Slider id="sfxRange" label="Volume des effets sonores" setting={settings.sfxVolume} min={0} max={100} scale={100} unit="%" />
        <Toggle id="voiceChk" label="Annonce vocale du nom de la salle" setting={settings.voice} />

        <div class="set-title">AFFICHAGE</div>
        <ThemePicker />
        <Slider id="fsRange" label="Taille du texte" setting={settings.textSize} min={100} max={160} step={10} unit="%" />
        <Toggle id="scanChk" label="Lignes horizontales (écran ancien)" setting={settings.scanlines} />
        <Toggle id="transChk" label="Écrans de transition" setting={settings.transitions} />

        <div class="set-title">PARTIE</div>
        <Slider id="cdRange" label="Compte à rebours" setting={settings.countdown} min={3} max={30} unit="s" />
        <Toggle id="wakeChk" label="Écran toujours allumé" setting={settings.wakeLock} />

        <p class="note">Musique et bruitages générés en direct par le navigateur (Web Audio), sans fichier ni droits d'auteur.</p>
        <VersionInfo />
        <div class="row">
          <button id="setClose" onClick={() => { settingsOpen.value = false; }}>Fermer</button>
        </div>
      </div>
    </Overlay>
  );
}

function Toggle({ id, label, setting }) {
  return (
    <label class="set">
      {label}
      <input type="checkbox" id={id} checked={setting.value} onChange={e => { setting.value = e.currentTarget.checked; }} />
    </label>
  );
}

/** Curseur ; `scale` convertit la valeur enregistrée (ex. 0,6) en valeur affichée (60 %). */
function Slider({ id, label, setting, min, max, step = 1, scale = 1, unit }) {
  const shown = Math.round(setting.value * scale);
  return (
    <label class="set">
      {label}
      <input type="range" id={id} min={min} max={max} step={step} value={shown}
        onInput={e => { setting.value = Number(e.currentTarget.value) / scale; }} />
      <span id={id.replace("Range", "Val")}>{shown} {unit}</span>
    </label>
  );
}

function ThemePicker() {
  return (
    <div class="themes" id="themes">
      {THEMES.map((theme, i) => (
        <button key={theme.name} class="theme" aria-pressed={String(settings.theme.value === i)}
          style={theme.font && { background: theme.bg, color: theme.fg, borderColor: mix(theme.fg, theme.bg, .4), fontFamily: fontStack(theme.font) }}
          onClick={() => { settings.theme.value = i; }}>
          {theme.name}
        </button>
      ))}
    </div>
  );
}

const OFFLINE_TEXT = {
  installing: "hors ligne : installation…",
  ready: "hors ligne : prêt",
  update: "hors ligne : nouvelle version, rechargez la page",
  unsupported: "hors ligne : non disponible",
};

function VersionInfo() {
  const date = BUILD.date.split("-").reverse().join("/");
  const commit = BUILD.commit ? ` (${BUILD.commit})` : "";
  return (
    <div class="version" id="versionInfo">
      NOSTROMO II · v{BUILD.version} · BUILD {BUILD.number}{commit} DU {date} · {OFFLINE_TEXT[offline.value]}
    </div>
  );
}
