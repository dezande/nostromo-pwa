// Scénario « Une simple formalité » : panneau du RH, puis contrat signé par empreinte (ici au clavier).
import { act } from "preact/test-utils";
import { audio } from "../audio/audio";
import { briefing } from "../state/ui";
import { $, mount } from "../test/render";
import { resetState } from "../test/state";
import { Recruitment, contractSigned } from "./Recruitment";

beforeEach(() => {
  jest.useFakeTimers();
  resetState();
  contractSigned.value = false;
  briefing.value = "contract";
  mount(<Recruitment />);
});
afterEach(() => jest.useRealTimers());

const key = (type: "keydown" | "keyup", key: string, repeat = false) =>
  act(() => { $("#fingerprint").dispatchEvent(new KeyboardEvent(type, { key, repeat, bubbles: true, cancelable: true })); });
const scanning = () => $(".fingerprint").classList.contains("scanning");

test("le panneau du RH mène au contrat, dont « Retour » revient au RH", () => {
  act(() => { briefing.value = "hr"; });
  expect($("#hr").classList.contains("show")).toBe(true);
  expect($("#hr").textContent).toContain("48 000 crédits");
  act(() => { $("#hrNext").click(); });
  expect(briefing.value).toBe("contract");
  expect($("#contract").classList.contains("show")).toBe(true);
  act(() => { $("#contractBack").click(); });
  expect(briefing.value).toBe("hr");
});

test("signature au clavier : Espace maintenue 1,5 s signe le contrat, puis Continuer passe aux règles", () => {
  // Dans jsdom le contrat n'a pas de hauteur : il est « lu jusqu'en bas », le lecteur est prêt.
  expect($("#fingerprint").hasAttribute("disabled")).toBe(false);
  expect($("#contractNext").hasAttribute("disabled")).toBe(true);
  expect($("#fingerprintMsg").textContent).toBe("APPOSEZ VOTRE EMPREINTE POUR SIGNER");
  key("keydown", " ");
  expect(scanning()).toBe(true);
  expect($("#fingerprintMsg").textContent).toBe("ANALYSE EN COURS… GARDEZ LE DOIGT POSÉ");
  act(() => { jest.advanceTimersByTime(1400); });
  expect(contractSigned.value).toBe(false);
  act(() => { jest.advanceTimersByTime(200); });
  expect(contractSigned.value).toBe(true);
  expect(scanning()).toBe(false);
  expect($(".fingerprint").classList.contains("signed")).toBe(true);
  expect($("#fingerprintMsg").textContent).toBe("CONTRAT SIGNÉ · EMPREINTE ENREGISTRÉE");
  expect($("#fingerprint").hasAttribute("disabled")).toBe(true);
  expect(audio.beep).toHaveBeenCalledWith(true);
  key("keyup", " ");
  expect(contractSigned.value).toBe(true); // reste signé
  expect($("#contractNext").hasAttribute("disabled")).toBe(false);
  act(() => { $("#contractNext").click(); });
  expect(briefing.value).toBe(1);
});

test("Entrée relâchée avant 1,5 s : pas de signature ; touche répétée ou autre touche : rien", () => {
  key("keydown", "Enter");
  expect(scanning()).toBe(true);
  act(() => { jest.advanceTimersByTime(1000); });
  key("keyup", "Enter");
  expect(scanning()).toBe(false);
  act(() => { jest.advanceTimersByTime(2000); });
  expect(contractSigned.value).toBe(false);
  expect($("#fingerprintMsg").textContent).toBe("APPOSEZ VOTRE EMPREINTE POUR SIGNER");
  expect($("#contractNext").hasAttribute("disabled")).toBe(true);
  // La répétition automatique d'une touche maintenue ne relance pas l'analyse ; une autre touche non plus.
  key("keydown", "Enter", true);
  expect(scanning()).toBe(false);
  key("keydown", "a");
  expect(scanning()).toBe(false);
  // Un nouvel appui, gardé assez longtemps, signe.
  key("keydown", "Enter");
  act(() => { jest.advanceTimersByTime(1500); });
  expect(contractSigned.value).toBe(true);
});
