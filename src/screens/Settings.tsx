// Réglages, en onglets : Affichage, Audio, Alerte, Système.
// Le dernier onglet ouvert est mémorisé ; navigation au clavier avec les flèches.
import type { Signal } from "@preact/signals";
import { Overlay } from "../components/Overlay";
import { audio, type AlertVariant } from "../audio/audio";
import { THEMES, mix, fontStack } from "../data/themes";
import { settings, type Layout, type SettingsTab } from "../state/settings";
import { returnHome, settingsOpen } from "../state/ui";
import { inGame } from "../state/game";
import { useState } from "preact/hooks";
import { BUILD, offline, type OfflineState } from "../state/pwa";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "display", label: "AFFICHAGE" },
  { id: "audio", label: "AUDIO" },
  { id: "alert", label: "ALERTE" },
  { id: "system", label: "SYSTÈME" },
];

export function Settings() {
  const tab = settings.settingsTab.value;
  const select = (id: SettingsTab) => { settings.settingsTab.value = id; };
  const onKey = (e: KeyboardEvent) => {
    const i = TABS.findIndex(t => t.id === tab);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const target = TABS[(next + TABS.length) % TABS.length].id;
    select(target);
    (document.getElementById(`tab-${target}`) as HTMLElement | null)?.focus();
  };

  return (
    <Overlay id="settings" show={settingsOpen.value}>
      <div class="panel settings-panel">
        <h2>RÉGLAGES</h2>
        <div class="tabs" role="tablist" aria-label="Réglages" onKeyDown={onKey}>
          {TABS.map(t => (
            <button key={t.id} id={`tab-${t.id}`} role="tab" class="tab" aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1} onClick={() => select(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div class="tab-panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "display" && (
            <>
              <LayoutPicker />
              <ThemePicker />
              <Slider id="fsRange" label="Taille du texte" setting={settings.textSize} min={100} max={160} step={10} unit="%" />
              <Toggle id="scanChk" label="Lignes horizontales (écran ancien)" setting={settings.scanlines} />
              <Toggle id="transChk" label="Écrans de transition" setting={settings.transitions} />
              <Toggle id="markerChk" label="Repère discret" setting={settings.markerDot} />
            </>
          )}
          {tab === "audio" && (
            <>
              <Toggle id="musicChk" label="Musique" setting={settings.music} />
              <Slider id="volRange" label="Volume de la musique" setting={settings.musicVolume} min={0} max={100} scale={100} unit="%" />
              <Slider id="sfxRange" label="Volume des effets sonores" setting={settings.sfxVolume} min={0} max={100} scale={100} unit="%" />
              <Toggle id="voiceChk" label="Annonce vocale du nom de la salle" setting={settings.voice} />
              <p class="note">Musique et bruitages générés en direct par le navigateur (Web Audio), sans fichier ni droits d'auteur.</p>
            </>
          )}
          {tab === "alert" && <AlertSettings />}
          {tab === "system" && (
            <>
              <Toggle id="wakeChk" label="Écran toujours allumé" setting={settings.wakeLock} />
              <VersionInfo />
            </>
          )}
        </div>

        {inGame.value && <ReturnHome />}
        <div class="row">
          <button id="setClose" onClick={() => { settingsOpen.value = false; }}>Fermer</button>
        </div>
      </div>
    </Overlay>
  );
}

/** « Retour à l'accueil » avec confirmation dans la page (pas de fenêtre du navigateur). */
function ReturnHome() {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <div class="row return-home">
        <button id="homeReturnBtn" onClick={() => setAsking(true)}>⌂ Retour à l'accueil</button>
      </div>
    );
  }
  return (
    <div class="return-home confirm" role="alertdialog" aria-labelledby="homeReturnQ">
      <p id="homeReturnQ">Abandonner l'entraînement en cours ?</p>
      <div class="row">
        <button class="big" id="homeReturnYes" onClick={returnHome}>Oui</button>
        <button id="homeReturnNo" onClick={() => setAsking(false)}>Non</button>
      </div>
    </div>
  );
}

const ALERTS: { id: AlertVariant; name: string; description: string }[] = [
  { id: "siren", name: "Sirène", description: "Sirène lente et grondement grave" },
  { id: "klaxon", name: "Klaxon", description: "Bip à deux tons, rythmé" },
  { id: "detector", name: "Détecteur", description: "Bip de détecteur et pulsation" },
];

/** Musique 2 : jouée pendant la partie. */
function AlertSettings() {
  const current = settings.alertVariant.value;
  return (
    <>
      <p class="note">Musique jouée pendant la partie, de la validation de la salle de départ jusqu'à la fin.</p>
      <div class="alert-cards" role="radiogroup" aria-label="Fond sonore de l'alerte">
        {ALERTS.map(a => (
          <button key={a.id} class="alert-card" id={`alert-${a.id}`} role="radio" aria-checked={current === a.id}
            onClick={() => { settings.alertVariant.value = a.id; }}>
            <strong>{a.name}</strong>
            <small>{a.description}</small>
          </button>
        ))}
      </div>
      <div class="row">
        <button id="alertPreview" onClick={() => audio.previewAlert(current)}>▶ Écouter</button>
      </div>
    </>
  );
}

function Toggle({ id, label, setting }: { id: string; label: string; setting: Signal<boolean> }) {
  return (
    <label class="set">
      {label}
      <input type="checkbox" id={id} checked={setting.value} onChange={e => { setting.value = e.currentTarget.checked; }} />
    </label>
  );
}

/** Curseur ; `scale` convertit la valeur enregistrée (ex. 0,6) en valeur affichée (60 %). */
interface SliderProps {
  id: string;
  label: string;
  setting: Signal<number>;
  min: number;
  max: number;
  step?: number;
  scale?: number;
  unit: string;
}

function Slider({ id, label, setting, min, max, step = 1, scale = 1, unit }: SliderProps) {
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

const LAYOUTS: { id: Layout; name: string }[] = [
  { id: "tablet", name: "Tablette" },
  { id: "phone", name: "Téléphone" },
];

/** Format de l'écran de jeu : tablette (deux colonnes) ou téléphone (tout empilé). */
function LayoutPicker() {
  const current = settings.layout.value;
  return (
    <div class="layout-picker">
      <span class="set-label" id="layoutLbl">Format</span>
      <div class="layouts" role="radiogroup" aria-labelledby="layoutLbl">
        {LAYOUTS.map(l => (
          <button key={l.id} class="layout-card" id={`layout-${l.id}`} role="radio" aria-checked={current === l.id}
            onClick={() => { settings.layout.value = l.id; }}>
            <span class={`layout-icon layout-icon-${l.id}`} aria-hidden="true" />
            {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThemePicker() {
  return (
    <div class="themes" id="themes">
      {THEMES.map((theme, i) => (
        <button key={theme.name} class="theme" aria-pressed={settings.theme.value === i}
          style={theme.font ? { background: theme.bg, color: theme.fg, borderColor: mix(theme.fg, theme.bg, .4), fontFamily: fontStack(theme.font) } : undefined}
          onClick={() => { settings.theme.value = i; }}>
          {theme.name}
        </button>
      ))}
    </div>
  );
}

const OFFLINE_TEXT: Record<OfflineState, string> = {
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
