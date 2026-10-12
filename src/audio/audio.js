// Musique et bruitages générés en direct avec Web Audio : aucun fichier audio, aucun droit d'auteur.
//
// Deux bus de volume : la musique (musicBus) et les effets (sfxBus), tous deux reliés au master.

let ctx = null;
let master, musicBus, sfxBus;
let music = null;          // musique en cours : { nodes, stop() }
let musicVolume = 0.6;
let sfxVolume = 1;

/** Crée le contexte audio, ou le relance s'il a été suspendu par le navigateur. */
function init() {
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume();
    return;
  }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = gain(0.9);
  const compressor = ctx.createDynamicsCompressor();
  master.connect(compressor);
  compressor.connect(ctx.destination);
  musicBus = gain(0, master);
  sfxBus = gain(sfxVolume, master);
}

// ---------- petits outils ----------

function gain(value, to) {
  const g = ctx.createGain();
  g.gain.value = value;
  if (to) g.connect(to);
  return g;
}

function osc(type, frequency) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = frequency;
  return o;
}

function filter(type, frequency, q) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  if (q !== undefined) f.Q.value = q;
  return f;
}

function noiseBuffer(seconds) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function noise(seconds, loop = false) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(seconds);
  n.loop = loop;
  return n;
}

function rampMusicTo(volume, seconds) {
  const t = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(t);
  musicBus.gain.setValueAtTime(musicBus.gain.value, t);
  musicBus.gain.linearRampToValueAtTime(volume, t + seconds);
}

// ---------- musique d'ambiance ----------

const PING_NOTES = [440, 523.25, 587.33, 622.25, 659.25, 783.99, 880, 1046.5, 1244.5];

function startMusic() {
  init();
  if (music) return;
  const nodes = [];
  const keep = node => { node.start(); nodes.push(node); return node; };

  // Nappe grave : dents de scie désaccordées dans un passe-bas qui « respire ».
  const lowpass = filter("lowpass", 260, 6);
  lowpass.connect(musicBus);
  for (const f of [55, 55.35, 82.4]) {
    const o = osc("sawtooth", f);
    o.connect(gain(0.1, lowpass));
    keep(o);
  }
  const breath = osc("sine", 0.05);
  breath.connect(gain(160, lowpass.frequency));
  keep(breath);

  const sub = osc("sine", 41.2);
  sub.connect(gain(0.25, musicBus));
  keep(sub);

  // Souffle de ventilation.
  const air = noise(4, true);
  const airGain = gain(0.05, musicBus);
  air.connect(filter("bandpass", 700, 0.8)).connect(airGain);
  keep(air);
  const airLfo = osc("sine", 0.11);
  airLfo.connect(gain(0.035, airGain.gain));
  keep(airLfo);

  // Écho pour les tintements.
  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.62;
  const echoFilter = filter("lowpass", 2200);
  delay.connect(echoFilter);
  echoFilter.connect(gain(0.55, delay));
  echoFilter.connect(musicBus);

  // Tintements aléatoires et grondements lointains.
  let alive = true;
  (function ping() {
    if (!alive) return;
    const now = ctx.currentTime;
    const note = PING_NOTES[Math.floor(Math.random() * PING_NOTES.length)];
    const o = osc(Math.random() < 0.5 ? "sine" : "triangle", note);
    const g = gain(0);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.07, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
    o.connect(g);
    g.connect(delay);
    g.connect(musicBus);
    o.start(now);
    o.stop(now + 2.6);

    if (Math.random() < 0.25) {
      const rumble = osc("sine", 70);
      rumble.frequency.setValueAtTime(70, now);
      rumble.frequency.exponentialRampToValueAtTime(30, now + 3);
      const rg = gain(0, musicBus);
      rg.gain.setValueAtTime(0, now);
      rg.gain.linearRampToValueAtTime(0.18, now + 0.8);
      rg.gain.linearRampToValueAtTime(0, now + 3);
      rumble.connect(rg);
      rumble.start(now);
      rumble.stop(now + 3.1);
    }
    setTimeout(ping, 1800 + Math.random() * 4200);
  })();

  rampMusicTo(musicVolume, 3);
  music = { nodes, stop() { alive = false; } };
}

function stopMusic() {
  if (!music) return;
  const current = music;
  music = null;
  current.stop();
  rampMusicTo(0, 1.5);
  setTimeout(() => current.nodes.forEach(n => { try { n.stop(); } catch { /* déjà arrêté */ } }), 1700);
}

function setMusicVolume(volume) {
  musicVolume = volume;
  if (ctx && music) musicBus.gain.setTargetAtTime(volume, ctx.currentTime, 0.2);
}

/** Baisse la musique pendant le compte à rebours. */
function duck(on) {
  if (ctx && music) musicBus.gain.setTargetAtTime(on ? musicVolume * 0.35 : musicVolume, ctx.currentTime, 0.3);
}

function setSfxVolume(volume) {
  sfxVolume = volume;
  if (ctx) sfxBus.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
}

// ---------- bruitages ----------

/** Bip du compte à rebours (aigu pour les 3 dernières secondes). */
function beep(high) {
  init();
  const t = ctx.currentTime;
  const o = osc("square", high ? 1320 : 880);
  const g = gain(0.0001, sfxBus);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (high ? 0.3 : 0.14));
  o.connect(g);
  o.start(t);
  o.stop(t + 0.35);
}

/** Petit clic du terminal. */
function tick() {
  init();
  const t = ctx.currentTime;
  const o = osc("square", 2400 + Math.random() * 800);
  const g = gain(0.025, sfxBus);
  g.gain.setValueAtTime(0.025, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  o.connect(g);
  o.start(t);
  o.stop(t + 0.04);
}

function siren(seconds) {
  init();
  const t = ctx.currentTime;
  const o = osc("sawtooth", 600);
  const wobble = osc("sine", 2.2);
  wobble.connect(gain(180, o.frequency));
  const g = gain(0, sfxBus);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.07, t + 0.1);
  g.gain.setValueAtTime(0.07, t + seconds - 0.1);
  g.gain.linearRampToValueAtTime(0, t + seconds);
  o.connect(filter("lowpass", 1800)).connect(g);
  o.start(t); wobble.start(t);
  o.stop(t + seconds); wobble.stop(t + seconds);
}

/** Porte blindée qui claque. */
function slam() {
  init();
  const t = ctx.currentTime;
  const n = noise(1.2);
  const thud = gain(0.9, sfxBus);
  thud.gain.setValueAtTime(0.9, t);
  thud.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
  n.connect(filter("lowpass", 500)).connect(thud);
  n.start(t);

  const low = osc("sine", 90);
  low.frequency.setValueAtTime(90, t);
  low.frequency.exponentialRampToValueAtTime(35, t + 0.5);
  const lowGain = gain(0.8, sfxBus);
  lowGain.gain.setValueAtTime(0.8, t);
  lowGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  low.connect(lowGain);
  low.start(t);
  low.stop(t + 0.8);

  // Résonance métallique.
  for (const f of [1170, 2390, 3610]) {
    const ring = gain(0.6, sfxBus);
    ring.gain.setValueAtTime(0.6, t);
    ring.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
    n.connect(filter("bandpass", f, 40)).connect(ring);
  }
}

/** Cri d'alien (plus long à la dernière fermeture). */
function alien(long) {
  init();
  const t = ctx.currentTime + 0.35;
  const d = long ? 4.2 : 1.8;
  const o = osc("sawtooth", 260);
  o.frequency.setValueAtTime(260, t);
  o.frequency.exponentialRampToValueAtTime(1500, t + d * 0.3);
  o.frequency.exponentialRampToValueAtTime(700, t + d * 0.55);
  if (long) o.frequency.exponentialRampToValueAtTime(1900, t + d * 0.75);
  o.frequency.exponentialRampToValueAtTime(180, t + d);
  const vibrato = osc("sine", 28);
  vibrato.connect(gain(90, o.frequency));

  const g = gain(0, sfxBus);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.35, t + 0.15);
  g.gain.setValueAtTime(0.35, t + d * 0.7);
  g.gain.linearRampToValueAtTime(0, t + d);
  o.connect(filter("bandpass", 1400, 3)).connect(g);
  o.start(t); vibrato.start(t);
  o.stop(t + d + 0.05); vibrato.stop(t + d + 0.05);

  const hiss = noise(d);
  const hg = gain(0, sfxBus);
  hg.gain.setValueAtTime(0, t);
  hg.gain.linearRampToValueAtTime(0.25, t + 0.2);
  hg.gain.linearRampToValueAtTime(0, t + d);
  hiss.connect(filter("highpass", 3000)).connect(hg);
  hiss.start(t);
}

/** Petit accord de victoire. */
function victory() {
  init();
  const t = ctx.currentTime;
  [261.63, 329.63, 392, 523.25].forEach((f, i) => {
    const start = t + i * 0.18;
    const o = osc("triangle", f);
    const g = gain(0, sfxBus);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.15, start + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 3);
    o.connect(g);
    o.start(start);
    o.stop(t + 3.1);
  });
}

export const audio = {
  init, startMusic, stopMusic, setMusicVolume, setSfxVolume, duck,
  beep, tick, siren, slam, alien, victory,
  get musicVolume() { return musicVolume; },
  get playing() { return !!music; },
  get state() { return ctx ? ctx.state : "none"; },
};
