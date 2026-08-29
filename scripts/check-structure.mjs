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

/** Every href nav.json marks as built — the same source the site filters on. */
const navBuiltSet = new Set();
{
  const nav = JSON.parse(await readFile("src/data/nav.json", "utf8"));
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === "object") {
      if (typeof node.href === "string" && node.built === true) navBuiltSet.add(node.href);
      for (const v of Object.values(node)) if (v && typeof v === "object") walk(v);
    }
  };
  walk(nav);
}
const navBuilt = (href) => navBuiltSet.has(href);

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

const audienceBodies = new Map();

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

    if (dir.endsWith("audiences")) audienceBodies.set(data.slug, h);
  }
}

// --- Emergency pages -------------------------------------------------------

for (const { file, data } of await loadCollection("src/content/emergency")) {
  const page = `/${data.slug}/`;
  const h = await html(data.slug);
  if (!h) {
    fail(page, `built from ${file} but dist/${data.slug}/index.html does not exist`);
    continue;
  }

  // One form only, and it is the secondary path at the foot of the page.
  checkCommon(page, h, { forms: 1, schemaTypes: ["Service", "BreadcrumbList", "FAQPage"] });

  const band = h.indexOf('class="callband"');
  const h1 = h.search(H1);
  const actions = h.indexOf('data-actions');
  const arrival = h.indexOf('class="arrival"');
  const form = h.indexOf('class="lead__form"');

  if (band === -1) fail(page, "amber call band missing — the phone number must be the first thing on the page");
  if (!/class="callband"[^>]*/.test(h) || !h.includes('href="tel:2084094505"')) {
    fail(page, "call band is not a tel: link");
  }

  // The ordering IS the page. Anything that sells must come after anything
  // that helps, and the phone number comes before both.
  if (band > -1 && h1 > -1 && band > h1) fail(page, "call band renders after the h1");
  if (actions === -1) fail(page, "immediate-actions block missing");
  if (actions > -1 && arrival > -1 && actions > arrival) {
    fail(page, "arrival section renders before the immediate actions");
  }
  if (actions > -1 && form > -1 && form < actions) {
    fail(page, "a lead form renders above the immediate actions — calling is the primary path here");
  }

  const wantActions = data.actions?.items?.length ?? 0;
  const gotActions = count(h, /class="action__num mono"/g);
  if (gotActions !== wantActions) {
    fail(page, `entry lists ${wantActions} immediate actions but ${gotActions} rendered`);
  }
  if (data.actions?.caution && !h.includes('class="actions__caution"')) {
    fail(page, "safety caution did not render");
  }

  const wantSteps = data.arrival?.steps?.length ?? 0;
  const gotSteps = count(h, /class="arrival__step"/g);
  if (gotSteps !== wantSteps) fail(page, `arrival has ${wantSteps} steps but ${gotSteps} rendered`);

  const wantSections = data.sections?.length ?? 0;
  const headings = count(h, /<h2[^>]*>/g);
  if (headings < wantSections) {
    fail(page, `entry declares ${wantSections} sections but only ${headings} h2 headings rendered`);
  }

  // With no hero form to scroll past, the persistent bar must not be gated.
  if (h.includes("data-cta-bar") && /data-cta-bar[^>]*data-watch-top="[^"]+"/.test(h)) {
    fail(page, "CTA bar has a watch-top on a page with no hero form — it would never appear");
  }
}

// --- Guides (visual walkthroughs) -----------------------------------------

for (const { file, data } of await loadCollection("src/content/guides")) {
  const page = `/${data.slug}/`;
  const h = await html(data.slug);
  if (!h) {
    fail(page, `built from ${file} but dist/${data.slug}/index.html does not exist`);
    continue;
  }

  checkCommon(page, h, { forms: 1, schemaTypes: ["BreadcrumbList", "FAQPage"] });

  // The walkthrough IS the page: every element must render with its photo.
  const wantElements = data.build?.elements?.length ?? 0;
  const gotElements = count(h, /class="container element"/g);
  if (gotElements !== wantElements) {
    fail(page, `build declares ${wantElements} elements but ${gotElements} rendered`);
  }

  const wantPhotos = wantElements + (data.hero ? 1 : 0);
  const gotPhotos = count(h, /data-photo=/g);
  if (gotPhotos !== wantPhotos) {
    fail(page, `expected ${wantPhotos} photo slots (${wantElements} elements + hero), found ${gotPhotos}`);
  }

  // Each element must carry all three parts, or it is not making its argument.
  for (const part of [/class="element__what"/g, /class="element__without"/g]) {
    if (count(h, part) !== wantElements) {
      fail(page, `an element is missing a ${String(part).includes("what") ? "what" : "without"} block`);
    }
  }

  const wantChecks = data.checklist?.items?.length ?? 0;
  const gotChecks = count(h, /class="check"/g);
  if (gotChecks !== wantChecks) {
    fail(page, `checklist declares ${wantChecks} items but ${gotChecks} rendered`);
  }

  const wantSections = data.sections?.length ?? 0;
  if (count(h, /<h2[^>]*>/g) < wantSections) {
    fail(page, `entry declares ${wantSections} sections but fewer h2 headings rendered`);
  }

  // §13 allows one scroll reveal and it lives here. It must degrade safely:
  // nothing may be hidden by CSS that a script has to undo.
  if (!h.includes("data-reveal")) fail(page, "scroll reveal hooks missing");
  if (/\.element\[data-reveal\]\s*\{[^}]*opacity:\s*0/.test(h)) {
    fail(page, "elements are hidden before the script runs — reveal must be opt-in, not opt-out");
  }

  // §13: numbered markers belong only to the two 7-step process sequences.
  if (h.includes("step__marker")) fail(page, "numbered process markers on a guide (§13)");
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

// --- City pages ------------------------------------------------------------

const cityBodies = new Map();

for (const { file, data } of await loadCollection("src/content/cities")) {
  const page = `/${data.slug}/`;
  const h = await html(data.slug);
  if (!h) {
    fail(page, `built from ${file} but dist/${data.slug}/index.html does not exist`);
    continue;
  }

  checkCommon(page, h, { forms: 2, schemaTypes: ["Service", "BreadcrumbList", "FAQPage"] });

  const wantItems = data.areas?.items?.length ?? 0;
  const gotItems = count(h, /class="local"/g);
  if (gotItems !== wantItems) fail(page, `areas: ${wantItems} declared but ${gotItems} rendered`);

  const wantStages = data.logistics?.stages?.length ?? 0;
  const gotStages = count(h, /class="timeline__row"/g);
  if (gotStages !== wantStages) fail(page, `logistics: ${wantStages} stages but ${gotStages} rows`);

  // A city page serves one city; areaServed must not be the whole valley.
  const ld = [...h.matchAll(LDJSON)].map((m) => m[1]).join(" ");
  if (!ld.includes(`${data.name}, Idaho`)) {
    fail(page, `schema areaServed does not name ${data.name}`);
  }

  // §11: city pages carry an 800 word floor.
  const words = h
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  if (words < 800) fail(page, `${words} words, below the 800 floor for city pages (§11)`);

  cityBodies.set(data.slug, h);
}

/**
 * §2.5 forbids spun pages, and no other guard would notice one. This compares
 * every pair within a set on 6-word shingles taken from the rendered body.
 *
 * The chrome alone — nav, footer, two lead forms — plus shared sentences the
 * site deliberately repeats verbatim (the §6 pricing framing, the containment
 * explanation) puts genuine pages around 0.09-0.11. The cap is 0.20, so a page
 * written by find-and-replace from its neighbour lands far above it while
 * honest reuse of approved wording does not.
 */
const SIMILARITY_CAP = 0.2;

const shingle = (h) => {
  const words =
    h
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .toLowerCase()
      .match(/[a-z]+/g) ?? [];
  const out = new Set();
  for (let i = 0; i + 6 <= words.length; i++) out.add(words.slice(i, i + 6).join(" "));
  return out;
};

const checkSimilarity = (label, bodies) => {
  if (bodies.size < 2) return;
  const sets = new Map([...bodies].map(([slug, h]) => [slug, shingle(h)]));
  const slugs = [...sets.keys()];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const a = sets.get(slugs[i]);
      const b = sets.get(slugs[j]);
      let shared = 0;
      for (const sh of a) if (b.has(sh)) shared++;
      const jaccard = shared / (a.size + b.size - shared);
      if (jaccard > SIMILARITY_CAP) {
        fail(
          `/${slugs[i]}/`,
          `${(jaccard * 100).toFixed(0)}% text overlap with /${slugs[j]}/ — ${label} must not be spun variants (§2.5)`,
        );
      }
    }
  }
};

checkSimilarity("city pages", cityBodies);
checkSimilarity("audience pages", audienceBodies);

// --- Homepage --------------------------------------------------------------

{
  const [entry] = await loadCollection("src/content/home");
  const h = await html("");
  if (!entry) {
    fail("/", "src/content/home/index.md is missing");
  } else if (!h) {
    fail("/", "dist/index.html does not exist");
  } else {
    const d = entry.data;
    checkCommon("/", h, { forms: 2, schemaTypes: ["HomeAndConstructionBusiness", "FAQPage"] });

    // The grid is the routing core, and it must only offer pages that exist.
    const built = d.services.tiles.filter((t) => navBuilt(t.href));
    const rendered = count(h, /class="tile"/g);
    if (rendered !== built.length) {
      fail("/", `services grid: ${built.length} tiles target built pages but ${rendered} rendered`);
    }
    if (rendered === 0) fail("/", "services grid is empty — the homepage cannot route");
    for (const tile of d.services.tiles) {
      const live = navBuilt(tile.href);
      const present = h.includes(`href="${tile.href}"`);
      if (!live && !present) continue;
      if (!live && count(h, new RegExp(`href="${tile.href}"`, "g")) > 0 && !navBuilt(tile.href)) {
        // Only a nav/footer link may reference an unbuilt page — and nothing does.
        fail("/", `grid links to unbuilt ${tile.href}`);
      }
    }

    if (!h.includes("data-creds")) fail("/", "credentials strip missing");
    if (!h.includes("RCE-8871958")) fail("/", "Idaho registration missing from the credentials strip");
    if (!h.includes(`href="${d.emergency.href}"`)) fail("/", "emergency routing link missing");
    if (!h.includes(`href="${d.containment.href}"`)) fail("/", "containment teaser link missing");

    const wantCities = d.areas.cities.length;
    const gotCities = count(h, /class="area"/g);
    if (gotCities !== wantCities) fail("/", `areas: ${wantCities} declared but ${gotCities} rendered`);

    // A mask is not a credential. It must never reach structured data (§2.1).
    const ld = [...h.matchAll(LDJSON)].map((m) => m[1]).join(" ");
    if (ld.includes("NAT-F")) fail("/", "EPA RRP format mask is in structured data — it is not a real number");

    if (h.includes("Design system preview")) fail("/", "placeholder homepage copy still present");
  }
}

// --- Pricing framing (§6) --------------------------------------------------

/**
 * One phrasing, not five. A page that talks about cost must carry the approved
 * framing verbatim, and must not carry the older policy-flavored wording.
 */
{
  const defaults = await readFile("src/data/service-defaults.ts", "utf8");
  const canon = defaults.match(/export const PRICING_LINE =\s*\n?\s*"([^"]+)"/)?.[1];
  if (!canon) {
    problems.push("service-defaults.ts: PRICING_LINE is missing");
  } else {
    const needle = canon.slice(0, 90);
    for (const file of await readdir("dist")) {
      const page = `/${file}/`;
      const h = await html(file === "index.html" ? "" : file);
      if (!h) continue;
      const talksPrice = /what does .{0,30}cost|how much does/i.test(h);
      // A page may instead be discussing the testing company's fee, which is
      // not ours to frame — those attribute it explicitly.
      const attributedToTester =
        /that is the testing company's figure|the testing company sets|is the testing company's charge/i.test(h);
      if (talksPrice && !attributedToTester && !h.includes(needle)) {
        fail(page, "discusses our cost without the approved §6 pricing framing");
      }
      if (/We do not publish (a )?price/i.test(h)) {
        fail(page, 'uses the retired "we do not publish prices" wording (§6)');
      }
    }
  }
}

// --- Heading punctuation (§13) ---------------------------------------------

/**
 * Questions take a question mark; statements take no terminal period. The
 * opening word is not the test — most headings here begin with What/Why/How
 * as noun clauses rather than as questions — so this checks only the two
 * mechanical halves of the rule.
 */
{
  const strip = (raw) =>
    raw
      .replace(/<[^>]+>/g, "")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .trim();

  for (const dir of await readdir("dist")) {
    const h = await html(dir === "index.html" ? "" : dir);
    if (!h) continue;
    const page = dir === "index.html" ? "/" : `/${dir}/`;
    const main = h.match(/<main[\s\S]*?<\/main>/);
    if (!main) continue;

    for (const [, , raw] of main[0].matchAll(/<(h2|h3)[^>]*>([\s\S]*?)<\/\1>/g)) {
      const text = strip(raw);
      if (text.endsWith(".")) {
        fail(page, `heading ends in a period: "${text.slice(0, 60)}" (§13)`);
      }
    }
    for (const [, raw] of h.matchAll(/<h3 class="faq__q"[^>]*>([\s\S]*?)<\/h3>/g)) {
      const text = strip(raw);
      if (!text.endsWith("?")) {
        fail(page, `FAQ entry is not a question: "${text.slice(0, 60)}" (§13)`);
      }
    }
  }
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
  (await loadCollection("src/content/audiences")).length +
  (await loadCollection("src/content/emergency")).length +
  (await loadCollection("src/content/guides")).length +
  (await loadCollection("src/content/home")).length +
  (await loadCollection("src/content/cities")).length;
console.log(`Structure check passed — ${pages} collection page(s) match what their entries describe.`);
