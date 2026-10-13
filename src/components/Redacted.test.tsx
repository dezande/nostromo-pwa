import { render } from "preact";
import { Redact } from "./Redacted";

test("[[…]] devient une barre de blocs : le texte censuré n'est pas dans la page", () => {
  const root = document.createElement("div");
  render(<Redact text="Un élément [[de classe XX]] introduit." />, root);
  expect(root.textContent).toBe("Un élément ██ ██████ ██ introduit.");
  expect(root.querySelectorAll(".redacted")).toHaveLength(1);
  expect(root.innerHTML).not.toContain("XX");
});

test("texte sans censure : inchangé", () => {
  const root = document.createElement("div");
  render(<Redact text="Fiez-vous à votre instinct." />, root);
  expect(root.textContent).toBe("Fiez-vous à votre instinct.");
});
