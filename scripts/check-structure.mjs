/**
 * Structural smoke check.
 *
 * The other guards catch unfilled tokens, dead nav links, and oversized
 * images. None of them notice a section that silently stops rendering — which
 * has happened: a schema edit that quietly failed to apply left showContainment
 * undefined, the containment band vanished from all seven service pages, and
 * every guard stayed green.
 *
 * So this asserts that what the collection entries describe is actually
 * present in dist/. Expectations are DERIVED from the entries, not hardcoded,
 * so a new page is covered the moment it exists.
 *
 * Deliberately structural, not editorial. It checks that a section rendered,
 * never what it says.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

/** Frontmatter from every .md in a collection directory. */
const loadCollection = async (dir) => {
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(dir, file), "utf8");
      const m = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!m) throw new Error(`${dir}/${file}: no frontmatter — is the closing --- missing?`);
      return { file, data: parseYaml(m[1]) };
    }),
  );
};

const html = async (slug) => {
  const file = path.join("dist", slug, "index.html");
  if (!existsSync(file)) return null;
  return readFile(file, "utf8");
};

const count = (h, re) => (h.match(re) ?? []).length;

const SEAM = /<div class="seam"/g;
const BAND_SERVICE = /class="container containment__inner"/g;
const BAND_SECTIONS = /class="container band-full__inner"/g;
const FORM = /class="lead__form"/g;
const H1 = /<h1[\s>]/g;
const LDJSON = /type="application\/ld\+json">([\s\S]*?)<\/script>/g;

/** Checks every content page shares, whatever its type. */
const checkCommon = (page, h, { forms = 1, schemaTypes = [] } = {}) => {
  if (count(h, H1) !== 1) fail(page, `expected exactly 1 <h1>, found ${count(h, H1)}`);
  if (count(h, FORM) < forms) fail(page, `expected at least ${forms} lead form(s), found ${count(h, FORM)}`);
  if (!/<title>[^<]+<\/title>/.test(h)) fail(page, "missing or empty <title>");
  if (!/<meta name="description" content="[^"]+"/.test(h)) fail(page, "missing meta description");
  if (h.includes("{{")) fail(page, "unfilled {{ token in output");

  const blocks = [...h.matchAll(LDJSON)].map((m) => {
    try {
      return JSON.parse(m[1]);
    } catch {
      fail(page, "JSON-LD block does not parse");
      return null;
    }
  });
  const types = blocks.filter(Boolean).map((b) => b["@type"]);
  if (types.length === 0) fail(page, "no JSON-LD schema block");
  for (const t of schemaTypes) {
    if (!types.includes(t)) fail(page, `missing ${t} schema (found ${types.join(", ") || "none"})`);
  }
  if (h.includes("PostalAddress")) fail(page, "PostalAddress in schema — §3 forbids it");
  if (h.includes("aggregateRating")) fail(page, "aggregateRating in schema — §2.2 forbids it");
};

// --- Service pages ---------------------------------------------------------

for (const { file, data } of await loadCollection("src/content/services")) {
  const page = `/${data.slug}/`;
  const h = await html(data.slug);
  if (!h) {
    fail(page, `built from ${file} but dist/${data.slug}/index.html does not exist`);
    continue;
  }

  checkCommon(page, h, { forms: 2, schemaTypes: ["Service", "BreadcrumbList", "FAQPage"] });

  // The band renders unless the entry opts out (§13).
  const wantsBand = data.showContainment !== false;
  const hasBand = count(h, BAND_SERVICE) === 1;
  if (wantsBand && !hasBand) {
    fail(page, "containment band missing — showContainment is not false, so it must render");
  }
  if (!wantsBand && hasBand) {
    fail(page, "containment band present despite showContainment: false");
  }

  // Four fixed positions, less the scope divider when the band precedes it.
  const wantSeams = hasBand ? 3 : 4;
  const seams = count(h, SEAM);
  if (seams !== wantSeams) {
    fail(page, `expected ${wantSeams} seam dividers (band ${hasBand ? "on" : "off"}), found ${seams}`);
  }

  const steps = data.process?.steps?.length ?? 0;
  const markers = count(h, /class="step__marker mono"/g);
  if (markers !== steps) fail(page, `process has ${steps} steps but ${markers} numbered markers rendered`);

  const stages = data.timeline?.stages?.length ?? 0;
  const rows = count(h, /class="timeline__row"/g);
  if (rows !== stages) fail(page, `timeline has ${stages} stages but ${rows} rows rendered`);

  const scopeItems = data.scope?.items?.length ?? 0;
  if (scopeItems > 0 && !h.includes("class=\"scope\"")) fail(page, "scope list did not render");
}

// --- Problem and audience pages -------------------------------------------

for (const dir of ["src/content/problems", "src/content/audiences"]) {
  for (const { file, data } of await loadCollection(dir)) {
    const page = `/${data.slug}/`;
    const h = await html(data.slug);
    if (!h) {
      fail(page, `built from ${file} but dist/${data.slug}/index.html does not exist`);
      continue;
    }

    checkCommon(page, h, { forms: 2, schemaTypes: ["FAQPage", "BreadcrumbList"] });

    const sections = data.sections ?? [];
    // The opening section renders inside the hero grid unless it is a band,
    // so its `shift` never produces a divider.
    const restStart = sections[0]?.band ? 0 : 1;
    let want = 1; // the seam before the FAQ
    for (let i = restStart; i < sections.length; i++) {
      if (sections[i].shift && !(i > 0 && sections[i - 1].band)) want++;
    }
    const seams = count(h, SEAM);
    if (seams !== want) fail(page, `expected ${want} seam dividers, found ${seams}`);

    const wantBands = sections.filter((s) => s.band).length;
    const bands = count(h, BAND_SECTIONS);
    if (bands !== wantBands) fail(page, `expected ${wantBands} full-bleed band(s), found ${bands}`);

    const wantSections = sections.length;
    const headings = count(h, /<h2[^>]*>/g);
    if (headings < wantSections) {
      fail(page, `entry declares ${wantSections} sections but only ${headings} h2 headings rendered`);
    }
  }
}

// --- Standalone pages ------------------------------------------------------

for (const [slug, opts] of [
  ["contact", { forms: 1 }],
  ["thank-you", { forms: 0 }],
]) {
  const h = await html(slug);
  if (!h) {
    fail(`/${slug}/`, "page missing from dist/");
    continue;
  }
  if (count(h, H1) !== 1) fail(`/${slug}/`, `expected exactly 1 <h1>, found ${count(h, H1)}`);
  if (count(h, FORM) < opts.forms) fail(`/${slug}/`, `expected at least ${opts.forms} lead form(s)`);
  if (h.includes("{{")) fail(`/${slug}/`, "unfilled {{ token in output");
}

// --- Sitewide chrome -------------------------------------------------------

const home = await html("");
if (home) {
  if (!home.includes('class="site-header"')) fail("/", "site header missing");
  if (!home.includes('class="site-footer"')) fail("/", "site footer missing");
  if (!home.includes('class="callbar"')) fail("/", "mobile call bar missing");
}

// --- Report ----------------------------------------------------------------

if (problems.length) {
  console.error(`Structure check failed — ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const pages =
  (await loadCollection("src/content/services")).length +
  (await loadCollection("src/content/problems")).length +
  (await loadCollection("src/content/audiences")).length;
console.log(`Structure check passed — ${pages} collection page(s) match what their entries describe.`);
