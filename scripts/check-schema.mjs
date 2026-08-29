/**
 * Structured data guard (§11).
 *
 * The other four guards cover tokens, page structure, nav links and image
 * weight. None of them would notice schema that contradicts the page — which
 * had already happened: 14 FAQ answers were shipping raw markdown link syntax
 * into JSON-LD, so the machine-readable text and the visible text disagreed.
 *
 * Everything here compares emitted schema against what the page actually
 * renders, rather than against a list of expectations kept by hand.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

const REQUIRED_BUSINESS = [
  "@id", "name", "url", "telephone", "email",
  "areaServed", "openingHoursSpecification",
];

/** Visible text of an HTML fragment, normalized the way schema text should be. */
const visible = (html) =>
  html
    // No substitution: these fields contain only inline markup (<a>, <span>),
    // so replacing a tag with a space would invent one before punctuation —
    // "seepage</a>," becomes "seepage ," and looks like a divergence.
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const pages = [];
const walk = async (dir) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full);
    else if (e.name === "index.html") pages.push(full);
  }
};
if (!existsSync("dist")) {
  console.error("Schema check: dist/ does not exist");
  process.exit(1);
}
await walk("dist");

let counts = {};
let businessNodes = 0;

for (const file of pages.sort()) {
  const h = await readFile(file, "utf8");
  const url = "/" + file.slice("dist/".length, -"index.html".length);
  const isHome = url === "/";

  const blocks = [...h.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => m[1],
  );

  if (blocks.length === 0) {
    fail(url, "no JSON-LD at all");
    continue;
  }
  if (blocks.length > 1) {
    fail(url, `${blocks.length} JSON-LD blocks — the page should emit one @graph`);
  }

  let doc;
  try {
    doc = JSON.parse(blocks[0]);
  } catch {
    fail(url, "JSON-LD does not parse");
    continue;
  }
  if (!Array.isArray(doc["@graph"])) {
    fail(url, "JSON-LD is not an @graph");
    continue;
  }

  const nodes = doc["@graph"];
  for (const n of nodes) counts[n["@type"]] = (counts[n["@type"]] ?? 0) + 1;

  // --- Never, anywhere -----------------------------------------------------
  const raw = JSON.stringify(doc);
  for (const banned of ["aggregateRating", "AggregateRating", '"Review"', "reviewRating"]) {
    if (raw.includes(banned)) {
      fail(url, `${banned} in structured data — no reviews render on this site (§2.2)`);
    }
  }
  if (raw.includes("PostalAddress")) {
    fail(url, "PostalAddress in structured data — service-area business (§3)");
  }
  // A visible pending mask must never be asserted to a machine.
  if (/NAT-F_+/.test(raw)) {
    fail(url, "EPA RRP format mask emitted as a credential (§2.1)");
  }

  // --- Business entity -----------------------------------------------------
  const biz = nodes.filter((n) => n["@type"] === "HomeAndConstructionBusiness");
  if (biz.length !== 1) {
    fail(url, `expected exactly 1 business node, found ${biz.length}`);
  } else {
    businessNodes++;
    for (const prop of REQUIRED_BUSINESS) {
      if (biz[0][prop] === undefined) fail(url, `business entity missing ${prop}`);
    }
    if (!Array.isArray(biz[0].areaServed) || biz[0].areaServed.length !== 5) {
      fail(url, "business areaServed should list the five service-area cities");
    }
  }

  // --- Breadcrumbs ---------------------------------------------------------
  const crumbNode = nodes.find((n) => n["@type"] === "BreadcrumbList");
  if (!isHome && !crumbNode) fail(url, "no BreadcrumbList below the homepage");
  if (isHome && crumbNode) fail(url, "homepage should not emit a BreadcrumbList");
  if (crumbNode) {
    const visibleCrumbs = h.match(/<nav class="crumbs"[\s\S]*?<\/nav>/);
    if (!visibleCrumbs) {
      fail(url, "BreadcrumbList emitted but no breadcrumbs render on the page");
    } else {
      const shown = [...visibleCrumbs[0].matchAll(/<(?:a|span)[^>]*>([^<]+)<\/(?:a|span)>/g)]
        .map((m) => m[1].trim())
        .filter((t) => t && t !== "/");
      const declared = crumbNode.itemListElement.map((i) => i.name);
      if (shown.join(" > ") !== declared.join(" > ")) {
        fail(url, `breadcrumb markup "${declared.join(" > ")}" does not match rendered "${shown.join(" > ")}"`);
      }
    }
  }

  // --- Service -------------------------------------------------------------
  for (const svc of nodes.filter((n) => n["@type"] === "Service")) {
    if (!svc.provider?.["@id"]) {
      fail(url, "Service.provider must reference the business by @id, not inline it");
    }
    for (const prop of ["name", "serviceType", "description", "url"]) {
      if (!svc[prop]) fail(url, `Service missing ${prop}`);
    }
  }

  // --- FAQ: schema must mirror what renders --------------------------------
  const renderedQs = [...h.matchAll(/<h3 class="faq__q"[^>]*>([\s\S]*?)<\/h3>/g)].map((m) =>
    visible(m[1]),
  );
  const renderedAs = [...h.matchAll(/<p class="faq__a"[^>]*>([\s\S]*?)<\/p>/g)].map((m) =>
    visible(m[1]),
  );
  const faqNode = nodes.find((n) => n["@type"] === "FAQPage");

  if (renderedQs.length && !faqNode) {
    fail(url, `renders ${renderedQs.length} FAQ entries but emits no FAQPage`);
  }
  if (faqNode && !renderedQs.length) {
    fail(url, "emits FAQPage but renders no FAQ block");
  }
  if (faqNode && renderedQs.length) {
    const schemaQs = faqNode.mainEntity.map((q) => q.name.replace(/\s+/g, " ").trim());
    const schemaAs = faqNode.mainEntity.map((q) =>
      q.acceptedAnswer.text.replace(/\s+/g, " ").trim(),
    );
    if (schemaQs.length !== renderedQs.length) {
      fail(url, `FAQPage has ${schemaQs.length} entries, page renders ${renderedQs.length}`);
    }
    for (let i = 0; i < Math.min(schemaQs.length, renderedQs.length); i++) {
      if (schemaQs[i] !== renderedQs[i]) {
        fail(url, `FAQ question ${i + 1} diverges from the page: "${schemaQs[i].slice(0, 50)}"`);
      }
      if (schemaAs[i] !== renderedAs[i]) {
        fail(url, `FAQ answer ${i + 1} diverges from the page: "${schemaAs[i].slice(0, 50)}"`);
      }
    }
    for (const t of schemaQs.concat(schemaAs)) {
      if (/\]\(\/|\[\[/.test(t)) fail(url, "FAQ schema contains raw markdown syntax");
    }
  }
}

if (problems.length) {
  console.error(`Schema check failed — ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const summary = Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .map(([t, n]) => `${t} ${n}`)
  .join(", ");
console.log(`Schema check passed — ${pages.length} pages, one @graph each. ${summary}`);
