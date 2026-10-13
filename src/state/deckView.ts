// Format Téléphone : un seul pont est affiché à la fois.
import { computed, effect, signal } from "@preact/signals";
import { room } from "../data/ship";
import { position } from "./game";

/** Pont où se trouve le pion (null avant la pose). */
export const pawnDeck = computed(() => (position.value ? room(position.value).deck : null));

/** Pont affiché en format Téléphone. */
export const phoneDeck = signal<1 | 2>(1);

// Quand le pion change de pont (ascenseur, ou salle de départ sur l'autre pont), on bascule dessus.
let lastPawnDeck: 1 | 2 | null = null;
effect(() => {
  const d = pawnDeck.value;
  if (d && d !== lastPawnDeck) phoneDeck.value = d;
  if (!d && lastPawnDeck) phoneDeck.value = 1; // nouvelle partie : on repart du pont 1
  lastPawnDeck = d;
});
