// État de la partie et actions.
// Il n'y a pas de protocole dans l'app : le Coordinateur suit sa fiche papier et touche
// lui-même, sur le plan, la ou les salles à fermer.
import { signal, computed, batch } from "@preact/signals";
import { ADJ, ROOM_IDS, room, roomName, stepLabel, xenoVolume, type RoomId } from "../data/ship";
import { tr } from "../i18n";
import { audio } from "../audio/audio";
import { keepAwake, say, sleep } from "./device";

/** Nombre de fermetures d'un entraînement. */
export const STEP_COUNT = 8;

/** Déplacements au maximum avant une fermeture (les cartes W.Y.C. vont jusqu'à 5). Limite silencieuse. */
export const MAX_MOVES = 5;

/** Salles fermées au maximum en une fois (comme sur les fiches de protocole). Limite silencieuse. */
export const MAX_CLOSE = 2;

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
export const flashing = signal(new Set<RoomId>());  // salles qui viennent de se fermer
export const shake = signal(false);
/** Fin de partie : survie ou élimination, et salle où se trouvait l'agent. */
export const ending = signal<{ win: boolean; room: string } | null>(null);

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
  // Au-delà de 5 déplacements, plus aucune salle ne réagit (sans message).
  if (moves.value >= MAX_MOVES) return new Set();
  return new Set([...ADJ[position.value]].filter(isOpen));
});

/**
 * Salles que le Coordinateur peut choisir de fermer : 1 ou 2 à la fois, et au moins une salle
 * doit rester ouverte. Une fois la limite atteinte, on peut seulement désélectionner (sans message).
 */
export const closable = computed((): Set<RoomId> => {
  if (busy.value || phase.value !== "close") return new Set();
  const open = openRooms();
  if (toClose.value.size >= Math.min(MAX_CLOSE, open.length - 1)) return new Set(toClose.value);
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
  } else if (phase.value === "move" && from && reachable.value.has(id)) {
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

/** Fermeture immédiate des salles choisies : claquement, annonce, croix, cri du xénomorphe, puis suite ou fin. */
export async function closeRooms() {
  const rooms = ROOM_IDS.filter(id => toClose.value.has(id));
  if (phase.value !== "close" || busy.value || !rooms.length) return;
  audio.init();
  keepAwake();
  busy.value = true;

  const agent = position.value!;
  const label = stepLabel(rooms);
  batch(() => {
    closed.value = new Set([...closed.value, ...rooms]);
    toClose.value = new Set();
    flashing.value = new Set(rooms);
    shake.value = true;
    step.value++;
    moves.value = 0;
    trail.value = [];
  });
  const dead = rooms.includes(agent);
  const finished = step.value >= STEP_COUNT || openRooms().length <= 1;
  audio.slam();
  // Cri du xénomorphe, plus ou moins fort selon la distance entre le pion et la salle fermée.
  audio.xenomorph(xenoVolume(agent, rooms));
  say(rooms.length > 1
    ? tr("Fermeture des salles : ", "Sealing rooms: ") + label.replace("+", tr("et", "and"))
    : tr("Fermeture de la salle : ", "Sealing room: ") + label);
  setTimeout(() => { shake.value = false; }, 600);
  setTimeout(() => { flashing.value = new Set(); }, 1000);

  await sleep(finished || dead ? 2600 : 1400);
  busy.value = false;

  const name = roomName(agent);
  if (dead) {
    phase.value = "dead";
    showEnding(false, name);
  } else if (finished) {
    phase.value = "win";
    audio.victory();
    showEnding(true, name);
  } else {
    phase.value = "move";
  }
}

function showEnding(win: boolean, room: string) {
  setTimeout(() => { ending.value = { win, room }; }, win ? 600 : 200);
}
