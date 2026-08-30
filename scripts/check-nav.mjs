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

// Two URLs sharing a label makes the nav and every breadcrumb ambiguous.
const labels = new Map();
for (const entry of entries) {
  const prior = labels.get(entry.label);
  if (prior && prior !== entry.href) {
    problems.push(`label "${entry.label}" is used by both ${prior} and ${entry.href}`);
  }
  labels.set(entry.label, entry.href);
}

/**
 * §2.6 — /lead-paint-removal/ is built and linked. What stays blocked is the
 * NUMBER, not the page, so this guards the thing that is still capable of
 * going wrong: EPA RRP firm certification is unverified, and it must not
 * quietly become a claim.
 *
 * Two conditions, both of which have to hold while `verified` is false:
 *
 *   1. The value in credentials.ts stays a visible mask. Underscores are what
 *      make it legible to a reader as unfilled. A value with no underscores
 *      while unverified means somebody typed a number in, which is the exact
 *      §2.1 failure this repo exists to prevent.
 *   2. The mask never reaches structured data. A human can see NAT-F______-_
 *      is blank; a parser cannot, and would read it as an asserted credential.
 */
{
  const src = await readFile(new URL("../src/data/credentials.ts", import.meta.url), "utf8");
  const block = src.match(/label:\s*"EPA RRP Firm Certification"[\s\S]*?\n\s{2}\},/);
  if (!block) {
    problems.push("credentials.ts: EPA RRP Firm Certification entry not found — §2.6 guard cannot run");
  } else {
    const value = block[0].match(/value:\s*"([^"]*)"/)?.[1] ?? "";
    const verified = /verified:\s*true/.test(block[0]);
    if (!verified && !value.includes("_")) {
      problems.push(
        `credentials.ts: EPA RRP value "${value}" has no pending mask while verified is false — ` +
          "either it is a real number (set verified: true and record the issuer) or it is invented (§2.1, §2.6)",
      );
    }
    if (verified && value.includes("_")) {
      problems.push("credentials.ts: EPA RRP is marked verified but the value is still a mask");
    }
  }

  for (const entry of entries.filter((e) => e.built)) {
    const file = path.join("dist", entry.href, "index.html");
    if (!existsSync(file)) continue;
    const html = await readFile(file, "utf8");
    for (const [, ld] of html.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      if (ld.includes("NAT-F")) {
        problems.push(`${entry.href}: EPA RRP mask is in structured data — a mask is not a credential (§2.1)`);
      }
    }
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

