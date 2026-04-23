#!/usr/bin/env node
// Custom lightweight project-lint. Complements `next lint`.
//
// Rules:
//   1. No bare `any` in src/ .ts/.tsx files.
//   2. Every server-only module under src/server/ must import `"server-only"`.
//   3. No secrets (APPS_SCRIPT_URL, ADMIN_KEY, etc.) referenced from client components.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

const errors = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(full);
    } else if (/\.(ts|tsx)$/.test(name)) {
      inspect(full);
    }
  }
}

function inspect(file) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, "utf8");

  // Rule 1: bare `any`
  const bareAny = text
    .split("\n")
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => /\bany\b/.test(line))
    .filter(({ line }) => !/\/\/\s*eslint-disable/.test(line))
    .filter(({ line }) => !/@types\//.test(line))
    .filter(({ line }) => !/\b(many|anyway|anyone|banana)\b/.test(line));
  // allow `any` inside TS comments only
  for (const { line, i } of bareAny) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    if (/:\s*any\b/.test(line) || /<any\b/.test(line) || /\bas any\b/.test(line)) {
      errors.push(`${rel}:${i + 1} — bare \`any\` (${trimmed})`);
    }
  }

  // Rule 2: server-only import
  if (rel.startsWith("src/server/") && !text.includes('"server-only"')) {
    errors.push(`${rel} — server module missing \`import "server-only"\``);
  }

  // Rule 3: secret reference in client files
  if (text.startsWith('"use client"') || text.startsWith("'use client'")) {
    for (const secret of [
      "process.env.ADMIN_KEY",
      "process.env.APPS_SCRIPT_URL",
      "process.env.ADMIN_PASS_HASH",
    ]) {
      if (text.includes(secret)) {
        errors.push(`${rel} — client component references server secret ${secret}`);
      }
    }
  }
}

walk(SRC);

if (errors.length) {
  console.error("Project lint failed:");
  for (const e of errors) console.error("  • " + e);
  process.exit(1);
}
console.log(`Project lint passed (${SRC}).`);
