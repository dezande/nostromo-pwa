import { lang } from "../i18n";
import { SCENARIOS, SCENARIO_IDS, scenarioText } from "./scenarios";

const FR = SCENARIOS.fr;

beforeEach(() => { lang.value = "fr"; });

test("du plus simple au plus complexe : le mode sans scénario, puis les trois scénarios par niveau", () => {
  expect(SCENARIO_IDS).toEqual(["free", "training", "recruitment", "infiltrated"]);
  expect(Object.keys(SCENARIOS.en)).toEqual(SCENARIO_IDS);
});

test("une icône différente par scénario, la même dans les deux langues", () => {
  const icons = SCENARIO_IDS.map(id => FR[id].icon);
  expect(new Set(icons).size).toBe(SCENARIO_IDS.length);
  expect(SCENARIO_IDS.map(id => SCENARIOS.en[id].icon)).toEqual(icons);
});

test.each(Object.entries({ ...FR, ...Object.fromEntries(Object.entries(SCENARIOS.en).map(([k, v]) => [`${k} (en)`, v])) }))(
  "%s : 4 règles et deux rapports de fin avec la salle", (_id, s) => {
    expect(s.rules).toHaveLength(4);
    expect(s.win.lines.join(" ")).toContain("{room}");
    expect(s.dead.lines.join(" ")).toContain("{room}");
  });

test("Session disciplinaire : survie avec un message de la C.R.F.", () => {
  const s = FR.infiltrated;
  expect(s.firstPanel).toBe("email");
  expect(s.lastPanel).toBe("email");
  expect(s.rules[3].title).toBe("FIN DE LA SESSION");
  expect(s.rules.flatMap(r => r.points).join(" ")).not.toContain("entraînement");
  expect(s.win.note?.from).toContain("C.R.F.");
  expect(SCENARIOS.en.infiltrated.rules[3].title).toBe("END OF THE SESSION");
  expect(SCENARIOS.en.infiltrated.rules.flatMap(r => r.points).join(" ")).not.toContain("training");
});

test("Sans scénario : pas de panneau d'introduction, et un rapport neutre sans note", () => {
  expect(FR.free.firstPanel).toBeNull();
  expect(SCENARIOS.en.free.firstPanel).toBeNull();
  expect(FR.free.win.note).toBeUndefined();
  expect(SCENARIOS.en.free.win.note).toBeUndefined();
});

test("les trois scénarios joignent une note au rapport gagnant : ordre de mission, note de la Division scientifique, message C.R.F.", () => {
  expect(FR.training.win.note?.from).toContain("ORDRE DE MISSION");
  expect(FR.recruitment.win.note?.from).toContain("DIVISION SCIENTIFIQUE");
  expect(FR.recruitment.win.note?.text).toMatch(/\[\[.+\]\]/); // un passage censuré
  expect(FR.infiltrated.win.note?.from).toContain("C.R.F.");
});

test("difficulté croissante pour le joueur, avec une durée indicative", () => {
  expect(Object.values(FR).map(s => s.level)).toEqual(["Tous niveaux", "Débutant", "Intermédiaire", "Confirmé"]);
  expect(Object.values(SCENARIOS.en).map(s => s.level)).toEqual(["Any level", "Beginner", "Intermediate", "Experienced"]);
  for (const s of Object.values(FR)) expect(s.duration).toMatch(/\d+.*min/);
});

test("version anglaise : mêmes panneaux et scènes, textes traduits", () => {
  for (const id of SCENARIO_IDS) {
    const fr = FR[id], en = SCENARIOS.en[id];
    expect([en.firstPanel, en.lastPanel, en.duration]).toEqual([fr.firstPanel, fr.lastPanel, fr.duration]);
    expect(en.rules.map(r => r.scene)).toEqual(fr.rules.map(r => r.scene));
    expect(en.name).not.toBe(fr.name);
    // Une note dans une langue en appelle une dans l'autre, avec autant de passages censurés
    expect(en.win.note === undefined).toBe(fr.win.note === undefined);
    expect(en.win.note?.text.split("[[").length).toBe(fr.win.note?.text.split("[[").length);
  }
});

test("scenarioText suit la langue de l'app", () => {
  lang.value = "en";
  expect(scenarioText("recruitment").name).toBe("A Mere Formality");
  lang.value = "fr";
  expect(scenarioText("recruitment").name).toBe("Une simple formalité");
});
