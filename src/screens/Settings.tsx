// Réglages, en onglets : Affichage, Audio, Alerte, Système.
// Le dernier onglet ouvert est mémorisé ; navigation au clavier avec les flèches.
import type { Signal } from "@preact/signals";
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { audio, type AlertVariant } from "../audio/audio";
import { THEMES, mix, fontStack } from "../data/themes";
import { settings, type Layout, type SettingsTab } from "../state/settings";
import { scenarioText } from "../data/scenarios";
import { returnHome, settingsOpen } from "../state/ui";
import { inGame } from "../state/game";
import { useState } from "preact/hooks";
import { BUILD, offline, type OfflineState } from "../state/pwa";
import { LANGS, lang, tr } from "../i18n";

const tabs = (): { id: SettingsTab; label: string }[] => [
  { id: "display", label: tr("AFFICHAGE", "DISPLAY") },
  { id: "audio", label: "AUDIO" },
  { id: "alert", label: tr("ALERTE", "ALERT") },
  { id: "system", label: tr("SYSTÈME", "SYSTEM") },
];

export function Settings() {
  const tab = settings.settingsTab.value;
  const TABS = tabs();
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
        <h2>{tr("RÉGLAGES", "SETTINGS")}</h2>
        <div class="tabs" role="tablist" aria-label={tr("Réglages", "Settings")} onKeyDown={onKey}>
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
              <LangPicker />
              <LayoutPicker />
              <ThemePicker />
              <Slider id="fsRange" label={tr("Taille du texte", "Text size")} setting={settings.textSize} min={100} max={160} step={10} unit="%" />
              <Toggle id="scanChk" label={tr("Lignes horizontales (écran ancien)", "Scanlines (old screen)")} setting={settings.scanlines} />
              <Toggle id="transChk" label={tr("Écrans de transition", "Transition screens")} setting={settings.transitions} />
              <Toggle id="markerChk" label={tr("Repère discret", "Discreet marker")} setting={settings.markerDot} />
            </>
          )}
          {tab === "audio" && (
            <>
              <Toggle id="musicChk" label={tr("Musique", "Music")} setting={settings.music} />
              <Slider id="volRange" label={tr("Volume de la musique", "Music volume")} setting={settings.musicVolume} min={0} max={100} scale={100} unit="%" />
              <Slider id="sfxRange" label={tr("Volume des effets sonores", "Sound effects volume")} setting={settings.sfxVolume} min={0} max={100} scale={100} unit="%" />
              <Toggle id="voiceChk" label={tr("Annonce vocale du nom de la salle", "Spoken room name announcement")} setting={settings.voice} />
              <p class="note">{tr("Musique et bruitages générés en direct par le navigateur (Web Audio), sans fichier ni droits d'auteur.",
                "Music and sound effects generated live by the browser (Web Audio), with no files and no copyright.")}</p>
            </>
          )}
          {tab === "alert" && <AlertSettings />}
          {tab === "system" && (
            <>
              <Toggle id="wakeChk" label={tr("Écran toujours allumé", "Keep screen on")} setting={settings.wakeLock} />
              <VersionInfo />
            </>
          )}
        </div>

        <SettingsFooter tab={tab} />
      </div>
    </Overlay>
  );
}

/**
 * Boutons du bas, sur une seule rangée centrée, tous de la même taille :
 * « Écouter » (onglet Alerte), « Accueil » (en partie) et « Fermer ».
 * « Accueil » demande confirmation dans la page (pas de fenêtre du navigateur) :
 * la question s'affiche au-dessus et seuls « Oui » / « Non » restent, sur la même rangée (« Non » revient aux réglages).
 */
function SettingsFooter({ tab }: { tab: SettingsTab }) {
  const [asking, setAsking] = useState(false);
  const confirm = inGame.value && asking;
  return (
    <div class={confirm ? "settings-footer confirm" : "settings-footer"} role={confirm ? "alertdialog" : undefined}
      aria-labelledby={confirm ? "homeReturnQ" : undefined}>
      {confirm && <p id="homeReturnQ">{scenarioText(settings.scenario.value).quitQuestion}</p>}
      <div class="row icon-row settings-actions">
        {tab === "alert" && !confirm && (
          <IconButton id="alertPreview" icon="son" label={tr("Écouter", "Listen")} onClick={() => audio.previewAlert(settings.alertVariant.value)} />
        )}
        {inGame.value && !asking && (
          <IconButton id="homeReturnBtn" icon="accueil" label={tr("Accueil", "Home")} onClick={() => setAsking(true)} />
        )}
        {confirm && (
          <>
            <IconButton id="homeReturnYes" icon="valider" label={tr("Oui", "Yes")} onClick={returnHome} />
            <IconButton id="homeReturnNo" icon="retour" label={tr("Non", "No")} onClick={() => setAsking(false)} />
          </>
        )}
        {/* Pendant la confirmation : seulement Oui / Non (« Non » revient aux réglages) */}
        {!confirm && <IconButton id="setClose" icon="annuler" label={tr("Fermer", "Close")} onClick={() => { setAsking(false); settingsOpen.value = false; }} />}
      </div>
    </div>
  );
}

const ALERTS = (): { id: AlertVariant; name: string; description: string }[] => [
  { id: "siren", name: tr("Sirène", "Siren"), description: tr("Sirène lente et grondement grave", "Slow siren and deep rumble") },
  { id: "klaxon", name: "Klaxon", description: tr("Bip à deux tons, rythmé", "Rhythmic two-tone beep") },
  { id: "detector", name: tr("Détecteur", "Detector"), description: tr("Bip de détecteur et pulsation", "Detector beep and pulse") },
];

/** Musique 2 : jouée pendant la partie. */
function AlertSettings() {
  const current = settings.alertVariant.value;
  return (
    <>
      <p class="note">{tr("Musique jouée pendant la partie, de la validation de la salle de départ jusqu'à la fin.",
        "Music played during the game, from confirming the starting room until the end.")}</p>
      <div class="alert-cards" role="radiogroup" aria-label={tr("Fond sonore de l'alerte", "Alert soundtrack")}>
        {ALERTS().map(a => (
          <button key={a.id} class="alert-card" id={`alert-${a.id}`} role="radio" aria-checked={current === a.id}
            onClick={() => { settings.alertVariant.value = a.id; }}>
            <strong>{a.name}</strong>
            <small>{a.description}</small>
          </button>
        ))}
      </div>
    </>
  );
}

function Toggle({ id, label, setting }: { id: string; label: string; setting: Signal<boolean> }) {
  return (
    <label class="set toggle">
      <span class="set-label">{label}</span>
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
      <span class="set-label">{label}</span>
      <input type="range" id={id} min={min} max={max} step={step} value={shown}
        onInput={e => { setting.value = Number(e.currentTarget.value) / scale; }} />
      <span class="set-value" id={id.replace("Range", "Val")}>{shown} {unit}</span>
    </label>
  );
}

const LAYOUTS = (): { id: Layout; name: string }[] => [
  { id: "tablet", name: tr("Tablette", "Tablet") },
  { id: "phone", name: tr("Téléphone", "Phone") },
];

/** Langue de l'app : Français ou English (aussi à l'accueil). */
function LangPicker() {
  return (
    <div class="layout-picker">
      <span class="set-label" id="langLbl">{tr("Langue", "Language")}</span>
      <div class="layouts" role="radiogroup" aria-labelledby="langLbl">
        {LANGS.map(l => (
          <button key={l} class="layout-card" id={`setLang-${l}`} role="radio" aria-checked={lang.value === l} lang={l}
            onClick={() => { lang.value = l; }}>
            {l === "fr" ? "Français" : "English"}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Format de l'écran de jeu : tablette (deux colonnes) ou téléphone (tout empilé). */
function LayoutPicker() {
  const current = settings.layout.value;
  return (
    <div class="layout-picker">
      <span class="set-label" id="layoutLbl">{tr("Format", "Layout")}</span>
      <div class="layouts" role="radiogroup" aria-labelledby="layoutLbl">
        {LAYOUTS().map(l => (
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
      {THEMES.map(theme => (
        <button key={theme.name} class="theme" aria-pressed={settings.theme.value === theme.name}
          style={theme.font ? { background: theme.bg, color: theme.fg, borderColor: mix(theme.fg, theme.bg, .4), fontFamily: fontStack(theme.font) } : undefined}
          onClick={() => { settings.theme.value = theme.name; }}>
          {theme === THEMES[0] ? tr("Nostromo (origine)", "Nostromo (original)") : theme.name}
        </button>
      ))}
    </div>
  );
}

const OFFLINE_TEXT = (): Record<OfflineState, string> => ({
  installing: tr("hors ligne : installation…", "offline: installing…"),
  ready: tr("hors ligne : prêt", "offline: ready"),
  update: tr("hors ligne : nouvelle version, rechargez la page", "offline: new version, reload the page"),
  unsupported: tr("hors ligne : non disponible", "offline: unavailable"),
});

function VersionInfo() {
  const date = lang.value === "en" ? BUILD.date : BUILD.date.split("-").reverse().join("/");
  const commit = BUILD.commit ? ` (${BUILD.commit})` : "";
  return (
    <div class="version" id="versionInfo">
      NOSTROMO II · v{BUILD.version} · BUILD {BUILD.number}{commit} {tr("DU", "OF")} {date} · {OFFLINE_TEXT()[offline.value]}
    </div>
  );
}
