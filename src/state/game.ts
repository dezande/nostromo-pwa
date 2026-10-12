// État de la partie et actions.
// Il n'y a pas de protocole dans l'app : le Coordinateur suit sa fiche papier et touche
// lui-même, sur le plan, la ou les salles à fermer.
import { signal, computed, batch } from "@preact/signals";
import { ADJ, ROOM_IDS, room, stepLabel, type RoomId } from "../data/ship";
import { audio } from "../audio/audio";
import { settings } from "./settings";
import { keepAwake, say, sleep } from "./device";
import { startTimer, stopTimer } from "./timer";

/** Nombre de fermetures d'un entraînement. */
export const STEP_COUNT = 8;

/**
 * Phases :
 * - "intro" : panneaux de bienvenue et d'explication (pas encore de partie)
 * - "place" : le Psychic Agent pose son pion ; il peut changer de salle jusqu'à « Valider »
 * - "move"  : déplacements ; « Valider » quand ils sont faits
 * - "close" : le Coordinateur touche la ou les salles à fermer, puis « Valider »
 * - "dead" / "win" : fin de partie
 */
export type Phase = "intro" | "place" | "move" | "close" | "dead" | "win";

export const phase = signal<Phase>("intro");
export const step = signal(0);                         // nombre de fermetures déjà faites
export const position = signal<RoomId | null>(null);   // salle du pion
export const startRoom = signal<RoomId | null>(null);  // salle de départ choisie
export const trail = signal<RoomId[]>([]);             // salles précédentes, pour « Annuler »
export const moves = signal(0);
export const closed = signal(new Set<RoomId>());       // salles fermées
export const toClose = signal(new Set<RoomId>());      // salles choisies par le Coordinateur
export const busy = signal(false);                     // compte à rebours en cours

// Effets visuels pendant une fermeture.
export const countdown = signal<{ n: number; room: string } | null>(null);
export const closing = signal(new Set<RoomId>());   // salles qui clignotent
export const flashing = signal(new Set<RoomId>());  // salles qui viennent de se fermer
export const shake = signal(false);
export const ending = signal<{ win: boolean; text: string } | null>(null);

export const inGame = computed(() => ["place", "move", "close"].includes(phase.value));

export const isOpen = (id: RoomId): boolean => !room(id).toxic && !closed.value.has(id);
export const openRooms = (): RoomId[] => ROOM_IDS.filter(isOpen);

/** Chemin depuis la dernière validation : salles visitées puis salle actuelle. */
export const path = computed((): RoomId[] =>
  position.value && (phase.value === "move" || phase.value === "close") ? [...trail.value, position.value] : []);

/** Salles où le pion peut aller maintenant. */
export const reachable = computed((): Set<RoomId> => {
  if (busy.value) return new Set();
  if (phase.value === "place") return new Set(openRooms());
  if (phase.value !== "move" || !position.value) return new Set();
  return new Set([...ADJ[position.value]].filter(isOpen));
});

/** Salles que le Coordinateur peut choisir de fermer (au moins une salle doit rester ouverte). */
export const closable = computed((): Set<RoomId> => {
  if (busy.value || phase.value !== "close") return new Set();
  const open = openRooms();
  if (toClose.value.size >= open.length - 1) return new Set(toClose.value); // on peut seulement désélectionner
  return new Set(open);
});

function reset(newPhase: Phase) {
  batch(() => {
    phase.value = newPhase;
    step.value = 0;
    position.value = null;
    startRoom.value = null;
    trail.value = [];
    moves.value = 0;
    closed.value = new Set();
    toClose.value = new Set();
    busy.value = false;
    ending.value = null;
  });
  stopTimer();
}

/** Avant la partie : panneaux d'accueil. */
export const showIntro = () => reset("intro");

/** Démarre la partie : le Psychic Agent choisit sa salle de départ. */
export function startGame() {
  audio.init();
  keepAwake();
  reset("place");
}

/** Toucher une salle : salle de départ, déplacement, ou choix d'une salle à fermer. */
export function touchRoom(id: RoomId) {
  if (busy.value) return;
  audio.init();
  const from = position.value;
  if (phase.value === "place" && isOpen(id)) {
    batch(() => { position.value = id; startRoom.value = id; });
    audio.beep(false);
  } else if (phase.value === "move" && from && ADJ[from].has(id) && isOpen(id)) {
    batch(() => { trail.value = [...trail.value, from]; position.value = id; moves.value++; });
    audio.beep(false);
  } else if (phase.value === "close" && closable.value.has(id)) {
    const next = new Set(toClose.value);
    if (next.has(id)) next.delete(id); else next.add(id);
    toClose.value = next;
    audio.beep(false);
  }
}

/** Confirme la salle de départ : les déplacements commencent. */
export function confirmStart() {
  if (phase.value !== "place" || !position.value) return;
  batch(() => { phase.value = "move"; trail.value = []; moves.value = 0; });
  audio.beep(true);
  startTimer(); // les 5 minutes de l'entraînement commencent
}

/** Déplacements terminés : le Coordinateur va choisir la salle à fermer. */
export function finishMoves() {
  if (phase.value !== "move") return;
  batch(() => { phase.value = "close"; toClose.value = new Set(); });
  audio.beep(true);
}

/** Bouton « Valider » : salle de départ, fin des déplacements, puis fermeture. */
export function validate() {
  if (phase.value === "place") confirmStart();
  else if (phase.value === "move") finishMoves();
  else if (phase.value === "close") void closeRooms();
}

export const canValidate = computed(() => {
  if (busy.value) return false;
  if (phase.value === "place") return !!position.value;
  if (phase.value === "move") return true;
  if (phase.value === "close") return toClose.value.size > 0;
  return false;
});

/** « Annuler » : dernier déplacement, ou retour aux déplacements pendant le choix de la salle à fermer. */
export function undo() {
  if (busy.value) return;
  if (phase.value === "close") {
    batch(() => { phase.value = "move"; toClose.value = new Set(); });
    return;
  }
  if (phase.value !== "move" || !trail.value.length) return;
  batch(() => {
    position.value = trail.value[trail.value.length - 1];
    trail.value = trail.value.slice(0, -1);
    moves.value = Math.max(0, moves.value - 1);
  });
}

export const canUndo = computed(() =>
  !busy.value && (phase.value === "close" || (phase.value === "move" && trail.value.length > 0)));

/** Fermeture des salles choisies : compte à rebours, annonce, claquement, puis suite ou fin. */
export async function closeRooms() {
  const rooms = ROOM_IDS.filter(id => toClose.value.has(id));
  if (phase.value !== "close" || busy.value || !rooms.length) return;
  audio.init();
  keepAwake();
  busy.value = true;

  const label = stepLabel(rooms);
  audio.duck(true);
  for (let n = settings.countdown.value; n > 0; n--) {
    countdown.value = { n, room: "" };
    audio.beep(n <= 3);
    if (n === 3) audio.siren(3);
    await sleep(1000);
  }
  countdown.value = { n: 0, room: label.toUpperCase() };
  closing.value = new Set(rooms);
  say((rooms.length > 1 ? "Fermeture des salles : " : "Fermeture de la salle : ") + label.replace("+", "et"));
  await sleep(settings.voice.value ? 2200 : 900);

  batch(() => {
    countdown.value = null;
    closing.value = new Set();
    closed.value = new Set([...closed.value, ...rooms]);
    toClose.value = new Set();
    flashing.value = new Set(rooms);
    shake.value = true;
    step.value++;
    moves.value = 0;
    trail.value = [];
  });
  const agent = position.value!;
  const dead = rooms.includes(agent);
  const finished = step.value >= STEP_COUNT || openRooms().length <= 1;
  audio.slam();
  audio.alien(finished || dead);
  setTimeout(() => { shake.value = false; }, 600);
  setTimeout(() => { flashing.value = new Set(); }, 1000);

  await sleep(finished || dead ? 2600 : 1400);
  busy.value = false;
  audio.duck(false);

  const name = room(agent).name;
  if (dead) {
    phase.value = "dead";
    showEnding(false, `Un xénomorphe a été introduit en ${name}. L'agent s'y trouvait.`);
  } else if (finished) {
    phase.value = "win";
    audio.victory();
    showEnding(true, `L'agent a survécu en ${name}. Le Psychic Agent a ressenti chaque présence alien.`);
  } else {
    phase.value = "move";
  }
}

function showEnding(win: boolean, text: string) {
  stopTimer();
  setTimeout(() => { ending.value = { win, text }; }, win ? 600 : 200);
}
