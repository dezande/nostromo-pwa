import { render } from "preact";
import { WeylandLogo } from "./WeylandLogo";

test("logo Weyland Corp : ailes, W et texte, dans la couleur du style (currentColor)", () => {
  const root = document.createElement("div");
  render(<WeylandLogo class="logo-watermark" />, root);
  const svg = root.querySelector("svg")!;
  expect(svg.getAttribute("class")).toContain("logo-watermark");
  expect(svg.getAttribute("fill")).toBe("currentColor");
  expect(svg.getAttribute("aria-hidden")).toBe("true");
  expect(svg.querySelectorAll(".weyland-w polygon")).toHaveLength(3);      // W : 3 triangles
  expect(svg.querySelectorAll(".weyland-wings polygon")).toHaveLength(6);  // ailes : 3 bandes de chaque côté
  expect(svg.querySelector(".weyland-w")!.getAttribute("stroke-linejoin")).toBe("round"); // triangles arrondis
  expect(svg.querySelector(".weyland-wings")!.getAttribute("stroke")).toBeNull();          // ailes à angles vifs
  expect(svg.textContent).toBe("WEYLAND CORP");
});

test("sans texte si demandé", () => {
  const root = document.createElement("div");
  render(<WeylandLogo text={false} />, root);
  expect(root.querySelector("text")).toBeNull();
});
