// État de la partie et actions du coordinateur.
import { signal, computed, batch } from "@preact/signals";
import { ADJ, ROOM_IDS, room, stepLabel, type RoomId } from "../data/ship";
import { STEP_COUNT, type Protocol } from "../data/protocols";
import { audio } from "../audio/audio";
import { settings } from "./settings";
import { keepAwake, say, sleep } from "./device";

export type Phase = "pick" | "place" | "move" | "dead" | "win";

/**
 * Phases :
 * - "pick"  : choix du protocole
 * - "place" : le Psychic Agent pose son pion
 * - "move"  : déplacements puis fermeture
 * - "dead" / "win" : fin de partie
 */
export const phase = signal<Phase>("pick");
export const protocol = signal<Protocol | null>(null);
export const step = signal(0);                         // nombre de fermetures déjà faites
export const position = signal<RoomId | null>(null);   // salle du pion
export const trail = signal<RoomId[]>([]);             // salles précédentes, pour « Annuler »
export const moves = signal(0);
export const closed = signal(new Set<RoomId>());       // salles fermées
export const busy = signal(false);         // compte à rebours en cours
export const peek = signal(false);         // fiche A.I.P. visible

// Effets visuels pendant une fermeture.
export const countdown = signal<{ n: number; room: string } | null>(null);
export const closing = signal(new Set<RoomId>());   // salles qui clignotent
export const flashing = signal(new Set<RoomId>());  // salles qui viennent de se fermer
export const shake = signal(false);
export const ending = signal<{ win: boolean; text: string } | null>(null);

export const inGame = computed(() => phase.value === "place" || phase.value === "move");

export const isOpen = (id: RoomId): boolean => !room(id).toxic && !closed.value.has(id);

/** Salles que l'on peut toucher maintenant. */
export const reachable = computed((): Set<RoomId> => {
  if (busy.value) return new Set();
  if (phase.value === "place") return new Set(ROOM_IDS.filter(isOpen));
  if (phase.value !== "move" || !position.value) return new Set();
  return new Set([...ADJ[position.value]].filter(isOpen));
});

function reset(newPhase: Phase, proto: Protocol | null = null) {
  batch(() => {
    phase.value = newPhase;
    protocol.value = proto;
    step.value = 0;
    position.value = null;
    trail.value = [];
    moves.value = 0;
    closed.value = new Set();
    busy.value = false;
    ending.value = null;
  });
}

/** Retour au choix du protocole. */
export const newGame = () => reset("pick");

/** Démarre la partie avec un protocole. */
export function startGame(proto: Protocol) {
  audio.init();
  keepAwake();
  reset("place", proto);
}

/** Toucher une salle : poser le pion, ou le déplacer vers une salle voisine. */
export function touchRoom(id: RoomId) {
  if (busy.value) return;
  audio.init();
  const from = position.value;
  if (phase.value === "place" && isOpen(id)) {
    batch(() => { position.value = id; phase.value = "move"; trail.value = []; moves.value = 0; });
    audio.beep(false);
  } else if (phase.value === "move" && from && ADJ[from].has(id) && isOpen(id)) {
    batch(() => { trail.value = [...trail.value, from]; position.value = id; moves.value++; });
    audio.beep(false);
  }
}

export function undo() {
  if (!trail.value.length) return;
  batch(() => {
    position.value = trail.value[trail.value.length - 1];
    trail.value = trail.value.slice(0, -1);
    moves.value = Math.max(0, moves.value - 1);
  });
}

/** Fermeture de salle : compte à rebours, annonce, claquement, puis victoire ou élimination. */
export async function closeRooms() {
  const proto = protocol.value;
  if (phase.value !== "move" || busy.value || !proto) return;
  audio.init();
  keepAwake();
  busy.value = true;

  const rooms = proto.steps[step.value];
  const last = step.value === STEP_COUNT - 1;
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
    flashing.value = new Set(rooms);
    shake.value = true;
    step.value++;
    moves.value = 0;
    trail.value = [];
  });
  audio.slam();
  audio.alien(last);
  setTimeout(() => { shake.value = false; }, 600);
  setTimeout(() => { flashing.value = new Set(); }, 1000);

  const agent = position.value!;
  const dead = rooms.includes(agent);
  await sleep(last ? 2600 : 1400);
  busy.value = false;
  audio.duck(false);

  const name = room(agent).name;
  if (dead) {
    phase.value = "dead";
    showEnding(false, `Un xénomorphe a été introduit en ${name}. L'agent s'y trouvait.`);
  } else if (step.value === STEP_COUNT) {
    phase.value = "win";
    audio.victory();
    showEnding(true, `Seule la ${name} reste ouverte. Le Psychic Agent a ressenti chaque présence alien.`);
  }
}

function showEnding(win: boolean, text: string) {
  setTimeout(() => { ending.value = { win, text }; }, win ? 600 : 200);
}
