/**
 * Nav integrity guard.
 *
 * nav.json's `built` flags decide what the header renders. A flag flipped
 * before its page exists would ship a dead link, so this asserts that every
 * built:true URL resolves to a real file in dist/. Runs after astro build,
 * alongside check:placeholders.
 *
 * Also catches duplicate hrefs, which would mean the same page is declared in
 * two places and can drift.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const nav = JSON.parse(await readFile(new URL("../src/data/nav.json", import.meta.url), "utf8"));

/** Walk primary + secondary and collect every entry that has an href. */
const collect = (node, out = []) => {
  if (Array.isArray(node)) {
    for (const item of node) collect(item, out);
  } else if (node && typeof node === "object") {
    if (typeof node.href === "string") out.push(node);
    for (const [key, value] of Object.entries(node)) {
      if (key !== "href" && typeof value === "object") collect(value, out);
    }
  }
  return out;
};

const entries = collect(nav);
const problems = [];

const seen = new Map();
for (const entry of entries) {
  if (seen.has(entry.href)) {
    problems.push(`duplicate href ${entry.href} ("${seen.get(entry.href)}" and "${entry.label}")`);
  }
  seen.set(entry.href, entry.label);

  if (!entry.href.startsWith("/") || !entry.href.endsWith("/")) {
    problems.push(`${entry.href} must be absolute and end in a trailing slash (§9)`);
  }
}

// §2.6 — lead paint must not be linked or referenced anywhere.
for (const entry of entries) {
  if (entry.href.includes("lead-paint")) {
    problems.push(`${entry.href} is blocked by §2.6 until the real EPA RRP firm number lands`);
  }
}

for (const entry of entries.filter((e) => e.built)) {
  const file = path.join("dist", entry.href, "index.html");
  if (!existsSync(file)) {
    problems.push(`"${entry.label}" is built:true but ${file} does not exist`);
  }
}

if (problems.length) {
  console.error("Nav check failed:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const live = entries.filter((e) => e.built).length;
console.log(`Nav check passed — ${live} of ${entries.length} §9 URLs built and linked.`);
