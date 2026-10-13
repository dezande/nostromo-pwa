jest.mock("../audio/audio", () => require("../test/audioMock"));

import { audio } from "../audio/audio";
import * as game from "./game";
import { settings } from "./settings";
import "./alert";

beforeEach(() => { settings.music.value = true; settings.alertVariant.value = "siren"; game.showIntro(); jest.clearAllMocks(); });

test("la musique d'alerte joue de la validation de la salle de départ jusqu'à la fin de la partie", () => {
  game.startGame();
  expect(audio.startAlert).not.toHaveBeenCalled();
  game.touchRoom("cockpit");
  game.confirmStart();
  expect(audio.startAlert).toHaveBeenCalledWith("siren");
  game.validate(); // choix de la salle à fermer : elle continue
  expect(audio.stopAlert).not.toHaveBeenCalled();
  game.showIntro(); // retour à l'accueil
  expect(audio.stopAlert).toHaveBeenCalled();
});

test("musique coupée : pas de musique d'alerte", () => {
  settings.music.value = false;
  game.startGame();
  game.touchRoom("cockpit");
  game.confirmStart();
  expect(audio.startAlert).not.toHaveBeenCalled();
  settings.music.value = true;
  expect(audio.startAlert).toHaveBeenCalledWith("siren");
});

test("changer de fond sonore pendant la partie le remplace", () => {
  game.startGame();
  game.touchRoom("cockpit");
  game.confirmStart();
  settings.alertVariant.value = "klaxon";
  expect(audio.startAlert).toHaveBeenLastCalledWith("klaxon");
});
