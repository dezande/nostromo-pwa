#!/usr/bin/env node
// Hook PostToolUse (Edit, Write) de Claude Code : après chaque modification d'un fichier TypeScript du projet,
// vérification des types (tsc) puis tests Jest du fichier modifié ou de son test voisin (Foo.tsx → Foo.test.tsx).
// En cas d'échec, la sortie est renvoyée à Claude (code 2) pour qu'il corrige tout de suite.
// Les specs Playwright ne sont pas lancés ici (trop longs) : typecheck seulement.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let input = {};
try { input = JSON.parse(await readStdin()); } catch { process.exit(0); }
const file = input.tool_input?.file_path || input.tool_response?.filePath;
if (!file || !/\.(ts|tsx|mts)$/.test(file)) process.exit(0);
const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join("/");
if (rel.startsWith("..") || rel.startsWith("node_modules/")) process.exit(0);

const failures = [];
const types = run("npx", ["tsc", "--noEmit", "--pretty", "false"]);
if (types.status !== 0) failures.push(`Erreurs de types (npm run typecheck) :\n${types.output}`);

const test = jestFile(rel);
if (test) {
  const jest = run("npx", ["jest", test, "--silent"]);
  if (jest.status !== 0) failures.push(`Tests Jest en échec (npx jest ${test}) :\n${jest.output}`);
}

if (failures.length) {
  process.stderr.write(`Après la modification de ${rel} :\n\n${failures.join("\n\n")}\n`);
  process.exit(2);
}

/** Fichier de test Jest à lancer : le fichier lui-même s'il en est un, sinon son voisin Foo.test.ts(x), s'il existe. */
function jestFile(rel) {
  if (!rel.startsWith("src/")) return null;
  if (/\.test\.tsx?$/.test(rel)) return rel;
  if (rel.startsWith("src/test/")) return null; // outils communs aux tests : le typecheck suffit
  const base = rel.replace(/\.(ts|tsx)$/, "");
  for (const ext of [".test.ts", ".test.tsx"]) if (existsSync(path.join(root, base + ext))) return base + ext;
  return null;
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: "utf8", env: { ...process.env, FORCE_COLOR: "0", CI: "1" } });
  const output = `${r.stdout || ""}${r.stderr || ""}`.trim().split("\n").slice(-60).join("\n");
  return { status: r.status ?? 1, output };
}

function readStdin() {
  return new Promise(resolve => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(data));
  });
}
