#!/usr/bin/env node
// Hook PreToolUse (Bash) de Claude Code : avant un `git commit`, audit de sécurité des dépendances de production
// (npm audit, niveau « high » et plus). Une vulnérabilité bloque le commit (code 2) et son rapport revient à Claude.
// Sans réseau, l'audit est impossible : on prévient sans bloquer. Les autres commandes Bash passent sans rien faire.
import { spawnSync } from "node:child_process";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let input = {};
try { input = JSON.parse(await readStdin()); } catch { process.exit(0); }
const command = input.tool_input?.command || "";
if (!/\bgit\b[^|;&]*\bcommit\b/.test(command)) process.exit(0);

const r = spawnSync("npm", ["audit", "--omit=dev", "--audit-level=high"], { cwd: root, encoding: "utf8", env: { ...process.env, FORCE_COLOR: "0" } });
const output = `${r.stdout || ""}${r.stderr || ""}`.trim();
if (r.status === 0) process.exit(0);

if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|ENETUNREACH|network/i.test(output)) {
  process.stdout.write(JSON.stringify({ systemMessage: "npm audit impossible (pas de réseau) : commit sans audit des dépendances." }));
  process.exit(0);
}

process.stderr.write(`Commit bloqué : npm audit signale des vulnérabilités (niveau high ou critical) dans les dépendances de production.\n`
  + `Corriger (npm audit fix, ou monter la version du paquet) avant de committer.\n\n${output.split("\n").slice(-60).join("\n")}\n`);
process.exit(2);

function readStdin() {
  return new Promise(resolve => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(data));
  });
}
