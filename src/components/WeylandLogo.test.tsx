import { render } from "preact";
import { WeylandLogo } from "./WeylandLogo";

test("logo Weyland Corp : ailes, W et texte, dans la couleur du style (currentColor)", () => {
  const root = document.createElement("div");
  render(<WeylandLogo class="logo-watermark" />, root);
  const svg = root.querySelector("svg")!;
  expect(svg.getAttribute("class")).toContain("logo-watermark");
  expect(svg.getAttribute("fill")).toBe("currentColor");
  expect(svg.getAttribute("aria-hidden")).toBe("true");
  expect(svg.querySelectorAll("polygon").length).toBe(9); // 3 bandes × 2 ailes + 3 triangles du W
  expect(svg.querySelector(".weyland-w")!.getAttribute("stroke-linejoin")).toBe("round"); // coins arrondis
  expect(svg.textContent).toBe("WEYLAND CORP");
});

test("sans texte si demandé", () => {
  const root = document.createElement("div");
  render(<WeylandLogo text={false} />, root);
  expect(root.querySelector("text")).toBeNull();
});
