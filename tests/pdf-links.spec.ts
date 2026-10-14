// Chaque lien de document du choix du scénario (accueil) mène à un vrai PDF du build (pas à la page de l'app).
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const files = [...readFileSync("src/screens/Home.tsx", "utf8").matchAll(/file: "([^"]+\.pdf)"/g)].map(m => m[1]);

test("les PDF des scénarios existent et sont bien des PDF", async ({ request }) => {
  expect(files.length).toBeGreaterThanOrEqual(6);
  for (const file of files) {
    const res = await request.get(`fiches/${file}`);
    expect(res.status(), file).toBe(200);
    expect((await res.body()).subarray(0, 5).toString(), file).toBe("%PDF-");
  }
});
