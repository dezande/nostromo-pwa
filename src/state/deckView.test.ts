import * as game from "./game";
import { pawnDeck, phoneDeck } from "./deckView";

test("bascule automatique sur le pont du pion, et retour au pont 1 à la nouvelle partie", () => {
  game.startGame();
  expect(phoneDeck.value).toBe(1);
  game.touchRoom("vie");
  game.confirmStart();
  expect(pawnDeck.value).toBe(1);
  game.touchRoom("atelier"); // ascenseur
  expect(pawnDeck.value).toBe(2);
  expect(phoneDeck.value).toBe(2);
  phoneDeck.value = 1; // regard manuel sur l'autre pont
  game.touchRoom("entrepot3"); // même pont : pas de bascule forcée
  expect(phoneDeck.value).toBe(1);
  game.startGame();
  expect(phoneDeck.value).toBe(1);
});
