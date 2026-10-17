// Écran de fin : rapport sur un moniteur, lignes imprimées une à une, puis tampon ; Continuer ramène à l'accueil.
import { act } from "preact/test-utils";
import { audio } from "../audio/audio";
import { SCENARIOS } from "../data/scenarios";
import { lang } from "../i18n";
import { ending } from "../state/game";
import { settings } from "../state/settings";
import { homeOpen } from "../state/ui";
import { $, $$, mount } from "../test/render";
import { resetState } from "../test/state";
import { EndScreen } from "./EndScreen";

/** Durée de la « génération du rapport » (REPORT_MS dans EndScreen.tsx). */
const REPORT_MS = 1500;

beforeEach(() => {
  jest.useFakeTimers();
  resetState();
  settings.scenario.value = "training";
  mount(<EndScreen />);
});
afterEach(() => jest.useRealTimers());

const shownLines = () => $$(".end-line.shown").length;
const end = (win: boolean, room = "Cockpit") => act(() => { ending.value = { win, room }; });

test("caché tant que la partie n'est pas finie", () => {
  expect($("#end").classList.contains("show")).toBe(false);
  expect($$(".end-line")).toHaveLength(0);
});

test("élimination : les lignes du rapport s'impriment une à une (un tic chacune), puis le tampon s'appose (claquement)", () => {
  const report = SCENARIOS.fr.training.dead;
  end(false);
  expect($("#end").classList.contains("show")).toBe(true);
  expect($("#endPanel").classList.contains("dead")).toBe(true);
  expect($("#endTitle").textContent).toBe("AGENT ÉLIMINÉ");
  expect($(".monitor-label").textContent).toBe("MU/TH/UR 6000 · RAPPORT DE FIN DE SESSION");
  expect($(".monitor-status").textContent).toBe("GÉNÉRATION DU RAPPORT…");
  expect($$(".end-line")).toHaveLength(report.lines.length); // pas de ligne de statut dans ce rapport
  expect(shownLines()).toBe(0);
  expect($("#endStamp")).toBeNull();

  const step = REPORT_MS / (report.lines.length + 1);
  act(() => { jest.advanceTimersByTime(step + 1); });
  expect(shownLines()).toBe(1);
  expect(audio.tick).toHaveBeenCalledTimes(1);
  act(() => { jest.advanceTimersByTime(step * (report.lines.length - 1)); });
  expect(shownLines()).toBe(report.lines.length);
  expect(audio.tick).toHaveBeenCalledTimes(report.lines.length);
  expect($("#endStamp")).toBeNull(); // rapport encore en cours de génération
  act(() => { jest.advanceTimersByTime(step); });
  expect($("#endStamp").textContent).toBe("DOSSIER CLOS");
  expect(audio.slam).toHaveBeenCalledTimes(1);
  expect($(".monitor-status").textContent).toBe("RAPPORT ARCHIVÉ");
  // Plus rien ne se passe ensuite
  act(() => { jest.advanceTimersByTime(10_000); });
  expect(audio.tick).toHaveBeenCalledTimes(report.lines.length);
});

test("survie : statut, {room} remplacé par la salle en majuscules et mise en évidence, numéro de rapport, tampon", () => {
  const report = SCENARIOS.fr.training.win;
  end(true, "Serre hydroponique");
  expect($("#endPanel").classList.contains("win")).toBe(true);
  expect($("#endTitle").textContent).toBe("AGENT SURVIVANT");
  expect($("#endText").textContent).toBe(report.status);
  expect($$(".end-line")).toHaveLength(report.lines.length + 2); // statut + lignes + ordre de mission
  expect($("#endRef").textContent).toMatch(/ENT-\d{3}-[A-Z]/);
  const room = $(".end-room");
  expect(room.textContent).toBe("SERRE HYDROPONIQUE");
  expect($(".end-lines").textContent).not.toContain("{room}");
  const withRoom = report.lines.find(l => l.includes("{room}"))!;
  expect(room.parentElement!.textContent).toBe(withRoom.replace("{room}", "SERRE HYDROPONIQUE"));
  act(() => { jest.advanceTimersByTime(REPORT_MS + 10); });
  expect($("#endStamp").textContent).toBe("APTITUDE VALIDÉE");
  expect(shownLines()).toBe(report.lines.length + 2);
});

test("un nouveau numéro de rapport à chaque fin de partie", () => {
  const numbers = new Set<string>();
  for (let i = 0; i < 8; i++) {
    act(() => { ending.value = null; });
    end(false);
    numbers.add($("#endRef").textContent!.match(/INC-\d{3}-[A-Z]/)![0]);
  }
  expect(numbers.size).toBeGreaterThan(1);
});

test("Session disciplinaire : message d'une autre source affiché à part, sous le rapport", () => {
  settings.scenario.value = "infiltrated";
  const report = SCENARIOS.fr.infiltrated.win;
  end(true);
  expect($("#endNote").textContent).toContain(report.note!.from);
  expect($("#endNote").textContent).toContain(`« ${report.note!.text} »`);
  expect($$(".end-line")).toHaveLength(report.lines.length + 2); // statut + lignes + message
});

test("Une simple formalité : la note de la Division scientifique est jointe au rapport, ses passages censurés en barres", () => {
  settings.scenario.value = "recruitment";
  const note = SCENARIOS.fr.recruitment.win.note!;
  end(true);
  const shown = $("#endNote");
  expect(shown.textContent).toContain(note.from);
  expect(shown.textContent).toContain("spécimens XX-121 vivants");
  expect(shown.textContent).not.toContain("appât");
  expect($$("#endNote .redacted")).toHaveLength(2);
  expect(shown.textContent).toMatch(/ « .*█+.* »$/);
});

test("Sixième sens : l'ordre de mission suit le rapport gagnant ; le rapport d'incident n'a pas de note", () => {
  end(true);
  expect($("#endNote").textContent).toContain(SCENARIOS.fr.training.win.note!.from);
  act(() => { ending.value = null; });
  end(false);
  expect($("#endNote")).toBeNull();
});

test("Continuer efface le rapport et ramène à l'accueil", () => {
  homeOpen.value = false;
  end(false);
  act(() => { jest.advanceTimersByTime(REPORT_MS + 10); });
  expect($$("#end button")).toHaveLength(1);
  act(() => { $("#endNext").click(); });
  expect(ending.value).toBeNull();
  expect(homeOpen.value).toBe(true);
  expect($("#end").classList.contains("show")).toBe(false);
});

test("en anglais : rapport traduit", () => {
  lang.value = "en";
  end(false, "Cockpit");
  expect($(".monitor-label").textContent).toBe("MU/TH/UR 6000 · END OF SESSION REPORT");
  expect($("#endTitle").textContent).toBe(SCENARIOS.en.training.dead.title);
  expect($(".end-room").textContent).toBe("COCKPIT");
  act(() => { jest.advanceTimersByTime(REPORT_MS + 10); });
  expect($("#endStamp").textContent).toBe(SCENARIOS.en.training.dead.stamp);
  expect($(".monitor-status").textContent).toBe("REPORT ARCHIVED");
});
