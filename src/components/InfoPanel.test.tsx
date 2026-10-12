import { render } from "preact";
import { InfoPanel } from "./InfoPanel";

test("fenêtre d'informations : titre et message d'attente par défaut", () => {
  const root = document.createElement("div");
  render(<InfoPanel />, root);
  expect(root.querySelector("h2")!.textContent).toBe("INFORMATIONS");
  expect(root.textContent).toContain("EN ATTENTE DE DONNÉES");
});

test("fenêtre d'informations : affiche le contenu fourni", () => {
  const root = document.createElement("div");
  render(<InfoPanel><p>Salle de vie</p></InfoPanel>, root);
  expect(root.textContent).toContain("Salle de vie");
  expect(root.textContent).not.toContain("EN ATTENTE");
});
