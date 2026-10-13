jest.mock("../audio/audio", () => require("../test/audioMock"));

import { audio } from "../audio/audio";
import { settings } from "./settings";
import { remaining } from "./timer";
import "./alert";

const speak = jest.fn();
beforeAll(() => {
  // Synthèse vocale simulée : on note le texte et on déclenche début / fin.
  (window as unknown as { speechSynthesis: unknown }).speechSynthesis = {
    getVoices: () => [{ lang: "fr-FR" }],
    cancel: jest.fn(),
    speak: (u: SpeechSynthesisUtterance) => { speak(u.text, u.lang, u.rate, u.pitch); u.onstart?.(new Event("start") as SpeechSynthesisEvent); u.onend?.(new Event("end") as SpeechSynthesisEvent); },
  };
  (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = class { text: string; lang = ""; rate = 1; pitch = 1; voice = null; onstart?: (e: Event) => void; onend?: (e: Event) => void; onerror?: (e: Event) => void; constructor(t: string) { this.text = t; } };
});
beforeEach(() => { jest.useFakeTimers(); settings.music.value = true; remaining.value = null; settings.alertVariant.value = "siren"; settings.alertVoice.value = true; settings.alertCountdown.value = true; jest.clearAllMocks(); });
afterEach(() => jest.useRealTimers());

test("la musique d'alerte démarre avec le minuteur et s'arrête avec lui", () => {
  remaining.value = 300;
  expect(audio.startAlert).toHaveBeenCalledWith("siren");
  remaining.value = 299;
  expect(audio.startAlert).toHaveBeenCalledTimes(1);
  remaining.value = null;
  expect(audio.stopAlert).toHaveBeenCalled();
});

test("musique coupée : pas de musique d'alerte", () => {
  settings.music.value = false;
  remaining.value = 300;
  expect(audio.startAlert).not.toHaveBeenCalled();
  settings.music.value = true;
  expect(audio.startAlert).toHaveBeenCalledWith("siren");
});

test("changer de fond sonore pendant l'entraînement le remplace", () => {
  remaining.value = 200;
  settings.alertVariant.value = "klaxon";
  expect(audio.startAlert).toHaveBeenLastCalledWith("klaxon");
});

test("voix française toutes les 30 s, la musique baisse pendant qu'elle parle", () => {
  remaining.value = 300;
  expect(speak).toHaveBeenLastCalledWith("Alerte. Entraînement en cours. Il reste 5 minutes.", "fr-FR", 0.95, 0.8);
  expect(audio.alertDuck).toHaveBeenCalledWith(true);
  expect(audio.alertDuck).toHaveBeenLastCalledWith(false);
  remaining.value = 285;
  expect(speak).toHaveBeenCalledTimes(1);
  remaining.value = 270;
  expect(speak).toHaveBeenLastCalledWith("Il reste 4 minutes 30 secondes.", "fr-FR", 0.95, 0.8);
});

test("à zéro : phrase de fin, quatre bips, puis fin de la musique d'alerte", () => {
  remaining.value = 1;
  remaining.value = 0;
  expect(speak).toHaveBeenLastCalledWith("Temps écoulé. Fin de l'entraînement.", "fr-FR", 0.95, 0.8);
  expect(audio.alarm).toHaveBeenCalledTimes(1);
  expect(audio.stopAlert).not.toHaveBeenCalled();
  jest.advanceTimersByTime(2400);
  expect(audio.stopAlert).toHaveBeenCalled();
});
