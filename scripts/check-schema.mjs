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
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ORIGIN = "https://envirotechidaho.com";

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
/** §11 requires these unique on every page. Duplicates read as cannibalization. */
const titles = new Map();
const descriptions = new Map();

for (const file of pages.sort()) {
  const h = await readFile(file, "utf8");
  const url = "/" + file.slice("dist/".length, -"index.html".length);
  const isHome = url === "/";

  const title = h.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  const desc = h.match(/name="description" content="([^"]*)"/)?.[1]?.trim();
  if (title) {
    const prior = titles.get(title);
    if (prior) fail(url, `duplicate <title>, shared with ${prior} (§11)`);
    else titles.set(title, url);
  } else {
    fail(url, "no <title>");
  }
  if (desc) {
    const prior = descriptions.get(desc);
    if (prior) fail(url, `duplicate meta description, shared with ${prior} (§11)`);
    else descriptions.set(desc, url);
  } else {
    fail(url, "no meta description");
  }

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
    /**
     * Strip the JSON-LD before looking for UI. Searching the raw file matches
     * the BreadcrumbList itself and reports a false pass on every page — the
     * exact way this defect stayed invisible while 30 pages emitted breadcrumb
     * markup and rendered none.
     */
    const withoutSchema = h.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
      "",
    );
    const nav = withoutSchema.match(/<nav class="crumbs"[\s\S]*?<\/nav>/);

    if (!nav) {
      fail(url, "BreadcrumbList emitted but no breadcrumbs render on the page");
    } else {
      // Label AND destination. A trail that reads right but links wrong is the
      // same divergence wearing a different hat.
      const shown = [
        ...nav[0].matchAll(
          /<a href="([^"]+)"[^>]*>([^<]+)<\/a>|<span aria-current="page"[^>]*>([^<]+)<\/span>/g,
        ),
      ].map((m) => (m[1] ? { name: m[2].trim(), href: m[1] } : { name: m[3].trim(), href: url }));

      const declared = crumbNode.itemListElement.map((i) => ({
        name: i.name,
        href: i.item.replace(ORIGIN, "") || "/",
      }));

      const fmt = (t) => t.map((c) => `${c.name} (${c.href})`).join(" > ");
      if (fmt(shown) !== fmt(declared)) {
        fail(url, `breadcrumb schema "${fmt(declared)}" does not match rendered "${fmt(shown)}"`);
      }

      /**
       * Rendered but hidden is not rendered. Google's guidance is that
       * breadcrumb markup describes something a person can see, so the
       * container is checked against the CSS the page actually loads.
       */
      const css =
        (h.match(/<link rel="stylesheet" href="([^"]+)"/g) ?? [])
          .map((tag) => tag.match(/href="([^"]+)"/)[1])
          .filter((href) => existsSync(path.join("dist", href)))
          .map((href) => readFileSync(path.join("dist", href), "utf8"))
          .join("") + (h.match(/<style>[\s\S]*?<\/style>/g) ?? []).join("");

      const HIDE = /display\s*:\s*none|visibility\s*:\s*hidden|clip\s*:\s*rect\(\s*0|opacity\s*:\s*0|font-size\s*:\s*0/;
      for (const m of css.matchAll(/([^{}]*\.crumbs[^{}]*)\{([^}]*)\}/g)) {
        if (HIDE.test(m[2])) {
          fail(url, `breadcrumbs are hidden by CSS: ${m[1].trim()} { ${m[2].trim()} }`);
        }
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
