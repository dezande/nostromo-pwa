import { act } from "preact/test-utils";
import { TUTORIAL } from "../data/tutorial";
import { homeOpen, tutorial } from "../state/ui";
import { $, mount } from "../test/render";
import { resetState } from "../test/state";
import { Home } from "./Home";
import { Tutorial } from "./Tutorial";

beforeEach(() => {
  resetState();
  mount(<><Home /><Tutorial /></>);
});

test("le bouton de l'accueil ouvre le tutoriel sur la première page", () => {
  expect($("#tutorial").classList.contains("show")).toBe(false);
  expect($("#tutoBtn").getAttribute("aria-label")).toBe("Tutoriel 3D6 Système");
  act(() => { $("#tutoBtn").click(); });
  expect($("#tutorial").classList.contains("show")).toBe(true);
  expect($(".tuto-title").textContent).toBe(TUTORIAL[0].title);
  expect($("#tutoBack").hasAttribute("disabled")).toBe(true);
  expect($(".tuto-svg").getAttribute("role")).toBe("img");
});

test("on parcourt toutes les pages, chacune avec son pictogramme, puis on referme", () => {
  act(() => { tutorial.value = 0; });
  for (let i = 0; i < TUTORIAL.length - 1; i++) {
    expect($(".tuto-title").textContent).toBe(TUTORIAL[i].title);
    expect($(".tuto-svg").getAttribute("aria-label")).toBeTruthy();
    act(() => { $("#tutoNext").click(); });
  }
  expect($(".tuto-title").textContent).toBe(TUTORIAL[TUTORIAL.length - 1].title);
  expect($("#tutoNext")).toBeNull();
  act(() => { $("#tutoBack").click(); });
  expect(tutorial.value).toBe(TUTORIAL.length - 2);
  act(() => { $("#tutoNext").click(); });
  act(() => { $("#tutoDone").click(); });
  expect(tutorial.value).toBeNull();
  expect(homeOpen.value).toBe(true);
});

test("la croix ferme le tutoriel à tout moment", () => {
  act(() => { tutorial.value = 3; });
  act(() => { $("#tutoClose").click(); });
  expect(tutorial.value).toBeNull();
  expect($("#tutorial").classList.contains("show")).toBe(false);
});
