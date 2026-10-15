import { act } from "preact/test-utils";
import { SOURCES } from "../data/sources";
import { sourcesOpen } from "../state/ui";
import { $, $$, mount } from "../test/render";
import { resetState } from "../test/state";
import { Home } from "./Home";
import { Sources } from "./Sources";

beforeEach(() => {
  resetState();
  mount(<><Home /><Sources /></>);
});

const items = SOURCES.flatMap(g => g.items);

test("le bouton de l'accueil ouvre les sources, le bouton Retour les referme", () => {
  expect($("#sources").classList.contains("show")).toBe(false);
  expect($("#sourcesBtn").getAttribute("aria-label")).toBe("Sources et crédits");
  act(() => { $("#sourcesBtn").click(); });
  expect($("#sources").classList.contains("show")).toBe(true);
  expect($$(".source")).toHaveLength(items.length);
  act(() => { $("#sourcesBack").click(); });
  expect($("#sources").classList.contains("show")).toBe(false);
});

test("chaque adresse est un lien qui s'ouvre à part, et les principales ont un QR code", () => {
  act(() => { sourcesOpen.value = true; });
  const links = $$(".source-url") as HTMLAnchorElement[];
  expect(links.map(a => a.getAttribute("href"))).toEqual(items.filter(s => s.url).map(s => s.url));
  for (const a of links) {
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noopener");
  }
  const qrs = $$(".qr");
  expect(qrs).toHaveLength(items.filter(s => s.qr).length);
  for (const qr of qrs) {
    expect(qr.getAttribute("role")).toBe("img");
    expect(qr.getAttribute("aria-label")).toMatch(/^QR code : /);
    expect(qr.querySelector(".qr-on")!.getAttribute("d")).toMatch(/^M\d/);
  }
});

test("l'app, son code et les inspirations avec une adresse ont un QR code", () => {
  const withQr = items.filter(s => s.qr).map(s => s.url);
  expect(withQr).toEqual(expect.arrayContaining([
    "https://dezande.github.io/nostromo-pwa/",
    "https://github.com/dezande/nostromo-pwa",
    "https://claude.com/claude-code",
    "https://www.marchanddetrucs.com/magasin-de-magie/nos-produits/nostromo-ii.html",
    "https://3d6.ovh/",
    "https://github.com/Swordfish90/cool-retro-term",
  ]));
  for (const s of items) if (s.qr) expect(s.url).toBeTruthy();
});
