# CLAUDE.md — Enviro-Tech Idaho

Project instructions for Claude Code. Read this file fully before writing any code or content.

---

## 1. What this is

A ground-up replacement website for **Enviro-Tech Idaho**, a mold remediation, asbestos abatement, and water damage restoration company based in the Treasure Valley.

**The job:** rank in local organic search for mold, asbestos, and water damage queries across the Treasure Valley, and convert anxious homeowners and time-pressured realtors into phone calls.

**Why it's being rebuilt:** the current Wix site returns no crawlable body content. Every page shares the title tag `Home | Enviro-Tech Idaho`. The canonical points to `http://`. There are no meta descriptions. Google has almost nothing to index.

**Average job value is ~$7,500.** A handful of additional calls per year pays for everything. Build accordingly — depth over page count.

---

## 2. Non-negotiable rules

These override anything else in this file.

1. **Never invent a credential, license number, certification, statistic, or review.** If a value is unknown, emit the placeholder token and move on. This is a health-adjacent (YMYL) vertical and false credential claims are a regulatory problem, not a copy problem.
2. **The business has zero Google reviews today.** Do not write testimonials. Do not create a populated reviews page. Do not emit `aggregateRating` or `Review` schema. Fabricated review markup is a manual-action risk. Build the reviews page as an empty shell wired to real data later.
3. **No fear-mongering.** No "toxic black mold is killing your family." The audience is already scared; the brand's job is to be the calm expert in the room. Scare copy suppresses conversion here and invites quality scrutiny.
4. **No medical claims.** Describe health *risks* in general, sourced terms. Never diagnose, never promise health outcomes.
5. **Every page must be genuinely different.** No spun city pages. If a page can't justify 800+ words of real, specific content, don't build it.
6. **`/lead-paint-removal/` is BLOCKED.** Do not build, link to, or reference lead paint services until the real EPA RRP firm certification number is supplied. See §5.

---

## 3. Business facts (canonical — use these exact values everywhere)

```
Name:            Enviro-Tech Idaho
Phone:           (208) 409-4505
Tel link:        tel:2084094505
Email:           office@envirotechidaho.com
Founded:         2019
Hours:           24/7
Crew size:       3
Address:         NOT PUBLISHED — service-area business, no address anywhere on site
Domain:          envirotechidaho.com
```

**Service area.** Statewide coverage, Treasure Valley focus. Primary cities, in priority order:

1. Boise
2. Meridian
3. Nampa
4. Caldwell
5. Eagle

Say "serving the Treasure Valley and all of Idaho." Never lead with "all of Idaho" — it dilutes local relevance. Statewide coverage gets one mention on `/service-areas/` and in the footer, nowhere else.

**Because there is no published address:** do not emit `PostalAddress` in schema. Use `areaServed` and `ServiceArea` instead. The Google Business Profile must be configured as a service-area business with a hidden address.

---

## 4. Credentials

Display these prominently — sitewide footer, plus a dedicated `/certifications/` page. Credentials are this brand's single strongest E-E-A-T signal and the client's own intake names certifications as the #1 customer objection.

| Credential | Value | Status |
|---|---|---|
| Idaho Contractor Registration | `RCE-8871958` | Verified format, use it |
| Asbestos / mold certification | `CMR0000023347` | **Issuing organization unknown — see §5** |
| EPA RRP Firm Certification | `{{EPA_RRP_FIRM_NUMBER}}` | **BLOCKED — placeholder only** |
| IICRC | `{{IICRC_CERT}}` | Placeholder |
| Liability coverage | `{{LIABILITY_COVERAGE_AMOUNT}}` | Placeholder |
| Workers' comp | `{{WORKERS_COMP_STATUS}}` | Placeholder |

**Always pair a number with its issuing organization.** "Certified" with no issuer named is weak. "AHERA-accredited by [issuer], cert #X, current through [date]" is strong.

**Third-party clearance testing is confirmed and is a real differentiator.** Independent labs perform final asbestos clearance. Most competitors self-clear. Say this often and say it plainly: the company that does the work is not the company that certifies the work is done.

---

## 5. Open items — emit placeholders, never guess

Convention: `{{TOKEN_NAME}}` in content, tracked in `PLACEHOLDERS.md` at repo root.

```
{{EPA_RRP_FIRM_NUMBER}}      BLOCKING for lead paint page
{{CMR_ISSUING_ORG}}          Which body issued CMR0000023347
{{IICRC_CERT}}
{{LIABILITY_COVERAGE_AMOUNT}}
{{WORKERS_COMP_STATUS}}
{{WARRANTY_TERMS}}
{{BBB_STATUS}}
{{CHAMBER_MEMBERSHIP}}
{{GBP_URL}}
{{GBP_REVIEW_COUNT}}
{{TESTIMONIAL_1}} … {{TESTIMONIAL_8}}
{{PHOTO_CONTAINMENT_1}} … {{PHOTO_CONTAINMENT_4}}
{{PHOTO_BEFORE_AFTER_1}} … {{PHOTO_BEFORE_AFTER_6}}
{{DOES_NOT_DO}}              Sewage / biohazard scope — unconfirmed
```

**Build guard.** Add a postbuild script that greps `dist/` for `{{` and exits non-zero if found. Nothing with an unfilled token ever reaches production.

```json
"scripts": {
  "check:placeholders": "! grep -rl '{{' dist/ || (echo 'Unfilled placeholder in build output' && exit 1)",
  "build": "astro build && npm run check:placeholders"
}
```

---

## 6. Positioning

**Core position:** the containment-first operator. Documented, third-party verified, and clean enough that you'd let them work while you're home.

**The three pillars, in order:**

1. **Containment first.** A negative-pressure containment goes up before any work starts, on every job, mold or asbestos, regardless of size. Two pre-filters plus HEPA, ducted to an exterior opening, pulling a vacuum so nothing airborne leaves the work area. This is the single most concrete, most visual, most defensible thing the business does — and it directly answers the customer's real fear, which is "am I about to contaminate my whole house."
2. **Documented and independently verified.** Third-party clearance testing, lab-processed samples, paperwork a buyer's agent will accept.
3. **Insurance handled, homeowner represented.** Enviro-Tech bills the insurance company directly and works with the adjuster to get the homeowner the best possible outcome. The scope gets documented so it doesn't get denied.

**On the insurance line — precision matters.** The client's intake says "I work for them, not the insurance company." He also bills insurance directly. Both are true and the copy must hold both without contradiction:

> We bill your insurance directly and work with your adjuster — and we document every step so your scope holds up. You're the client. The paperwork just goes to them.

Never write "we don't work with insurance companies." Never write "we're on your side against your insurer."

**Free inspection. Paid testing.** These are different things and the copy must never blur them.

- The **inspection** — someone comes out, looks at the problem, writes an estimate — is **free**.
- **Testing** — collecting samples and sending them to an independent lab — is **paid**.

Never write "free testing," "free mold test," or "free air quality test." When testing cost comes up, sell the reason: samples go to an independent accredited lab, results are documented, and the company that gets paid to remove mold is not the company deciding whether you have mold. That separation is the point.

**24/7 is real and confirmed.** Put it in the hero. Water damage is the emergency service and the emergency page carries its own phone treatment.

---

## 7. Voice

Authoritative, calm, reassuring, educational, helpful.

**Write like the most experienced person on the job site explaining the situation to a homeowner who is worried.** Confident because he's done it a thousand times, not because he's selling.

Do:
- Short declarative sentences. Plain verbs.
- Name the actual thing: "negative pressure containment," "HEPA filtration," "clearance testing." Then explain it in one line. Specificity builds trust; vagueness reads as sales.
- Answer the question the reader actually has before pitching.
- Active voice. Second person.

Don't:
- Exclamation points. Ever.
- "Rest assured," "look no further," "state-of-the-art," "peace of mind" as a headline, "your trusted partner," "we understand that."
- Stacked adjectives. "Professional, reliable, trustworthy service" says nothing.
- Em-dash-heavy rhythm or three-item lists in every sentence.
- Hedging. If the answer is "usually 3–4 days," say that, not "timelines vary."

**Cody Mortensen is the owner and should be the face.** Owner-operator is the wedge against ServPro-style franchises and against Home Guard Environmental, the closest direct competitor. Founder bio on `/about/`, real photo, name in the copy where it fits naturally.

---

## 8. Services

**Build now:**

| Service | Priority | Notes |
|---|---|---|
| Mold remediation | **Primary** | Highest search volume, client wants more of it |
| Mold inspection & testing | High | Free inspection / paid lab testing distinction |
| Asbestos abatement | High | Highest margin, third-party clearance is the hook |
| Asbestos testing | High | |
| Water damage restoration | High | 24/7 emergency, own emergency page |
| Crawlspace drainage | Medium | Treasure Valley crawlspace housing stock |
| Crawlspace encapsulation | Medium | |
| Reconstruction after remediation | Medium | Full-cycle differentiator vs abatement-only shops |
| Hazardous material removal | Low | |

**Blocked:** lead paint testing, encapsulation, and removal. Real EPA RRP firm number required first.

**Unconfirmed scope:** sewage and biohazard. Do not advertise until `{{DOES_NOT_DO}}` is resolved.

**Documented process sequences** — these are real ordered sequences, so numbered steps are appropriate here (and only here):

*Asbestos:* Inspection & testing → Containment → Removal → Air monitoring → Decontamination → Disposal → Third-party clearance testing

*Mold:* Inspection & assessment → Containment → HEPA air filtration → Removal → Cleaning & sanitizing → Restoration → Final inspection

**Timeline facts:** on site within 1–2 days for non-emergency. Typical job 3–4 days, where the final day is machines running to clear the air. 24/7 response for water emergencies.

---

## 9. Site architecture

```
/                                      Home
/mold-remediation/                     ★ primary money page
/mold-inspection-testing/
/asbestos-abatement/                   ★
/asbestos-testing/
/water-damage-restoration/
/emergency-water-damage/               24/7, own phone treatment
/crawlspace-drainage/
/crawlspace-encapsulation/
/reconstruction/

CITY PAGES — phase 1 (mold only)
/mold-remediation-boise/
/mold-remediation-meridian/
/mold-remediation-nampa/
/mold-remediation-caldwell/
/mold-remediation-eagle/

CITY PAGES — phase 2 (do not build until phase 1 is indexed)
/asbestos-removal-{city}/  × 5

PROBLEM / INTENT PAGES
/mold-found-during-home-inspection/    ★ matches actual lead source
/black-mold-in-crawl-space/
/musty-smell-in-basement/
/water-stain-on-ceiling/
/popcorn-ceiling-asbestos/
/vermiculite-insulation/
/asbestos-testing-before-remodel/
/does-homeowners-insurance-cover-mold/
/mold-remediation-cost-idaho/          ★ see §10
/is-black-mold-dangerous/

AUDIENCE PAGES
/for-realtors/                         ★ primary referral source
/for-builders/
/for-property-managers/
/commercial/

TRUST
/our-containment-process/              ★ signature page
/certifications/
/about/
/service-areas/
/faq/
/reviews/                              empty shell, no fake content
/contact/
/privacy-policy/
```

★ = build these first and build them deepest.

**Trailing slashes on all URLs. Lowercase. Hyphens. No dates. No `/blog/` prefix** — problem pages are evergreen service content, not posts.

---

## 10. Page-specific direction

**`/` Home.** Hero: 24/7, Treasure Valley, containment-first, free inspection. Then services grid, containment process teaser, credentials strip, service areas, FAQ. Lead form above the fold on desktop, sticky call bar on mobile.

**`/our-containment-process/`** — the signature page. Show, in detail and with photos, what a proper negative-pressure containment looks like and why most jobs don't get one. This is simultaneously the differentiator, the trust builder, the sales tool, and the most linkable asset on the site. Give it the most effort. Photos are `{{PHOTO_CONTAINMENT_*}}` until supplied.

**`/mold-found-during-home-inspection/`** — this maps directly to the real lead source. Realtor or homeowner, deal in escrow, mold flagged on inspection, closing at risk. Lead with the timeline (3–4 days), the documentation the buyer's agent needs, and the free inspection. This page should convert harder than the homepage.

**`/mold-remediation-cost-idaho/`** — the client does not publish pricing, so this page explains **what drives cost** rather than quoting numbers: square footage, containment complexity, crawlspace vs. living space access, whether drywall has to come out, whether reconstruction follows. Use general industry ranges attributed as industry ranges, never as Enviro-Tech's prices. Ends in the free inspection CTA. Never state a price for this business.

**City pages.** Each needs genuinely local content or it doesn't get built. Housing stock is the angle: Boise's North End and Bench have pre-1980 homes with popcorn ceilings, vermiculite, and asbestos floor tile. Nampa and Caldwell have more crawlspace moisture and irrigation-adjacent water intrusion. Meridian and Eagle skew newer construction with different failure modes. Write to the actual building conditions in that city.

**`/reviews/`** — empty shell. Wire it to real GBP data once the profile exists. No placeholder testimonials rendered to the page.

---

## 11. SEO requirements

**Titles** — unique on every page, under 60 characters:
- Services: `Mold Remediation Boise & Treasure Valley | Enviro-Tech Idaho`
- Cities: `Mold Remediation in Boise, ID | Enviro-Tech Idaho`
- Problems: `Mold Found During a Home Inspection? What to Do | Enviro-Tech`

**Meta descriptions** — unique, 140–158 characters, include a city, a differentiator, and an action. Never auto-generate from body text.

**One `<h1>` per page.** Logical `h2`/`h3` nesting.

**Word counts:** money pages 1,200+. City pages 800+. Problem pages 900+. Below that, cut the page.

**Schema** — JSON-LD, one block per page:
- Sitewide: `HomeAndConstructionBusiness` with `areaServed`, `telephone`, `openingHoursSpecification` (24/7), `hasCredential`. **No `PostalAddress`. No `aggregateRating`.**
- Service pages: `Service` with `serviceType`, `provider`, `areaServed`
- Problem pages: `FAQPage` where the content genuinely is Q&A
- All pages: `BreadcrumbList`

Note: FAQ rich results are largely deprecated for non-government sites. The markup still helps LLM and AI Overview extraction, which is why it stays.

**Images:** descriptive filenames (`negative-pressure-containment-boise-crawlspace.jpg`), descriptive alt text including city where truthful, WebP via Astro's `<Image>`, explicit width/height, `loading="lazy"` below the fold, hero eager.

**Also required:** `sitemap.xml` (via `@astrojs/sitemap`), `robots.txt`, `https` canonical on every page, Open Graph and Twitter tags per page with a unique OG image where possible.

---

## 12. Internal linking

Maintain `src/data/link-map.json` mapping keyword → URL. Every page links to:
- Its parent service page
- 2–3 sibling or related problem pages
- The relevant city pages
- `/our-containment-process/` and `/certifications/` where trust is being established

Descriptive anchor text. Never "click here" or "learn more" as the anchor. Aim for 3–6 contextual in-body links per page, placed where they genuinely help the reader.

---

## 13. Design direction

The visual world here is containment: translucent poly sheeting, taped seams, HEPA housings, negative-pressure gauges, lab chain-of-custody forms. Clinical, controlled, documented. That's the aesthetic — **not** disaster-restoration red-and-yellow urgency, and not generic contractor blue.

**Palette**

Tuned to the client logo — white type plus a mint-to-emerald gradient on a transparent background. The brand green is emerald, not teal. The header and footer are dark bands; the body is a light field between them.

```css
--ink:      #0D2620;  /* deep green-black — header/footer background, body text */
--seal:     #0B7A52;  /* darkened emerald — links, buttons, interactive */
--spark:    #2ED47A;  /* logo mint — thin accents only */
--surface:  #F4F7F5;  /* page background */
--paper:    #FFFFFF;  /* cards, form surfaces */
--caution:  #E8A33D;  /* emergency / 24-7 ONLY */
--rule:     #D5DDD8;  /* hairlines, dividers */
```

**Usage rules — enforce everywhere:**

- **Structure.** Header and footer use `--ink` as background with light type on top. Body content stays on `--surface`. Dark bands top and bottom, light field between.
- **`--seal` is the only green used for text, links, and buttons.** It is darkened specifically to pass AA contrast on light backgrounds. Never substitute `--spark` for any of these.
- **`--spark` is for thin accents only:** the seam divider, small icons, underlines, hairline emphasis. Never body text, never large fills, never buttons.
- **`--caution` stays restricted to emergency and 24/7 elements.** Nothing else. Amber is the discipline test — the moment it's used for decoration, it stops meaning "emergency."
- **No gradients anywhere except inside the logo asset itself.**

Contrast is verified AA: `--seal` on `--surface` (4.97:1), `--surface` on `--ink` (14.8:1), `--caution` on `--ink` (7.4:1).

**Type**

- Display: **Montserrat** (600, 700) — geometric, confident. Headlines only, used with restraint. It carries a tall cap-height and sets tighter than an expanded face, so display sizes are pulled down and tracked slightly negative (`--track-display: -0.02em`). Uppercase labels track positive instead.
- Body: **Inter** (400, 600) — large x-height, built for UI and long-form legibility. Wants a slightly looser body line-height (`--leading-normal: 1.65`).
- Utility: **Roboto Mono** (400) — certification numbers, process step markers, and timeline figures only. Never body copy, never headings.

Self-host all three via Fontsource. Copy only the weights in use into `/public/fonts/` and write the `@font-face` rules there — no runtime dependency on `node_modules`, no render-blocking font CDN.

**Signature element: the containment seam.** Section dividers render as a double hairline with a small notched corner, echoing taped poly seams. It's the one memorable device — everything else stays quiet. Do not add a second decorative motif.

The notch sits at the **right end of the top hairline**, flush to the edge. Inset from the edge it stops reading as a corner and reads as a stray mark. The rule spans `--measure`, not the container: it separates body copy, so it aligns to the copy rather than overrunning it.

**Measure discipline.** `--measure` (68ch) is the readable text width, and **every functional hairline inside a prose section is capped to it** — process step dividers, timeline row rules, and any separator that sits between pieces of body copy. A rule that runs to the container edge while the copy above it stops at 68ch leaves a long tail of line pointing at nothing. Rules end where the text ends.

The list itself carries the cap (`max-width: var(--measure)` on the container of the rows), not the individual rule, so the copy and its separators share one edge.

Two things are exempt and run the full container:

- **The seam divider motif.** It is structure, not a separator inside copy.
- **The dark containment band.** Full-bleed by design.

**No trailing rule on a final item.** The last step, the last timeline row, the last credential: `:last-child` clears the border. A rule below the final item closes a box that isn't there.

**Divider placement is a rule, not a judgment call.** Dividers mark thematic shifts and nothing else. Not before the final CTA, not between subsections, not to fill space. How a shift is identified depends on the page type, because their structures differ.

**Service pages — four fixed positions.** Every service page has the same section order, so the positions are fixed in `src/layouts/ServicePage.astro` and an entry cannot choose its own:

| Position | The shift it marks |
|---|---|
| Before the process section | Explanation gives way to procedure |
| Before the scope section | Procedure gives way to scope and terms |
| Before the inspection/testing section | Scope gives way to commercial terms |
| Before the FAQ | Terms give way to Q&A |

**Problem pages — declared shifts.** A problem page's sections are an ordered array, not fixed fields; one page argues a timeline, another explains a material, and there is no shared order to pin positions to. So the entry declares where a movement begins:

```yaml
- heading: Why it has to be handled rather than explained away
  shift: true
```

The layout renders a seam above any section marked `shift: true`, plus one before the FAQ. This is the one place a collection entry influences divider placement, and only because the structure it is describing is genuinely its own. It declares *where the argument turns*; it does not get to decide how or whether a divider renders.

**Never place a divider immediately before or after a full-bleed band** — on either page type. The band's own edge is already the break, and a rule stacked against it reads as a doubled line. Enforcement is in the layout, not the entry, so it cannot be overridden:

- `ServicePage.astro` — the containment band sits directly before the scope section, so the scope divider is suppressed on any page that renders the band, and those pages carry three rather than four. Drop the band and the fourth returns on its own.
- `ProblemPage.astro` — `showSeam()` ignores `shift: true` when the preceding section is a band.

The rule to carry into any new page type: a layout owns whether a divider renders, an entry may at most describe its own structure.

**The containment band is opt-out, not opt-in.** It renders on every service page by default, because containment-first is the §6 positioning and it belongs on nearly all of them. A service that genuinely does not involve containment sets `showContainment: false` in its entry:

```yaml
slug: some-service
showContainment: false
```

Use the flag rather than bending a section's copy to justify its presence. Where containment is adjacent to the work but not part of it — testing, crawlspace drainage, reconstruction — override the `containment` copy instead, framing it as the work that follows or precedes. That is a real editorial connection. Writing filler to excuse a section that does not belong is not, and the flag exists so nobody has to.

Turning the band off restores the scope divider automatically, so a page without the band carries four dividers and one with it carries three. That is computed from whether the band actually rendered, not declared separately, so the two cannot drift apart.

Problem and audience pages need no equivalent: their band is already a per-section `band: true`, so it is opt-in by construction.

**Structure encodes meaning.** Numbered markers are used for the 7-step process sequences, because those genuinely are ordered sequences. They are not used anywhere else. Credential numbers set in mono, presented like a document rather than a badge graphic.

**Motion:** minimal. A single scroll-triggered reveal on the containment process sequence. Nothing else. `prefers-reduced-motion` respected throughout.

**Quality floor:** responsive to 360px, visible keyboard focus states, semantic landmarks, AA contrast minimum, tap targets 44px+.

---

## 14. Stack

- **Astro**, static output, zero client JS except the lead form and mobile nav
- **Cloudflare Workers with static assets** (not Pages — Cloudflare's own guidance points new projects to Workers)
- Images local in `/public`, optimized through Astro
- GA4 + Meta Pixel + Google Search Console
- Repo on GitHub, deploy via `wrangler`

`wrangler.jsonc`:

```jsonc
{
  "name": "envirotech-idaho",
  "compatibility_date": "2026-08-25",
  "assets": { "directory": "./dist", "not_found_handling": "404-page" }
}
```

**Content collections** in `src/content/`:

```
services/    slug, title, h1, metaDescription, priority, process[], faqs[], relatedProblems[]
cities/      slug, name, county, housingStockNotes, localDetail, priority
problems/    slug, title, h1, metaDescription, question, relatedServices[], relatedCities[]
```

City and service pages generate from collections so structure can't drift. **Unique body copy lives in the collection entry, not in the template.** The template provides the shell; it must never be the source of the words.

**Performance targets:** LCP under 2.0s on 4G mobile, CLS under 0.1, Lighthouse SEO 100.

---

## 15. Build order

1. Scaffold Astro, deploy a placeholder page to `workers.dev`, confirm the pipeline works end to end. **Do this before writing any content.**
2. Design system: tokens, type, base layout, header, footer, containment-seam divider.
3. Lead form component + sticky mobile call bar.
4. `/mold-remediation/` as the gold-standard page. Get it right, then use it as the pattern.
5. Remaining money pages.
6. `/our-containment-process/` and `/certifications/`.
7. Five mold city pages.
8. Problem pages.
9. Audience pages.
10. Trust and utility pages.
11. Schema, sitemap, robots, redirects.
12. Cut over DNS.

Commit after every working page. If a build breaks, roll back rather than debug forward.

---

## 16. Migration

Pull the full Wix URL list before decommissioning the old site. 301 every old URL to its closest new equivalent via `_redirects` — natively supported by Workers static assets.

Known existing pages: `/`, `/certifications`, `/services`. There are more; get the sitemap from the Wix dashboard.

Do not take the Wix site down until the new site is live, redirects are tested, and DNS has propagated. Build and verify on `workers.dev` first.

**GTM container `GTM-N9GZF7W7` exists on the current site** — confirm whether it's still in use before carrying it over.

---

## 17. Definition of done

A page ships only when all of the following are true:

- [ ] Unique title under 60 chars, unique meta description 140–158 chars
- [ ] Single `<h1>`, logical heading nesting
- [ ] Word count meets the §11 minimum
- [ ] Valid JSON-LD, no `aggregateRating`, no `PostalAddress`
- [ ] 3–6 contextual internal links with descriptive anchors
- [ ] All images have descriptive filenames, alt text, and explicit dimensions
- [ ] Phone number matches §3 exactly, everywhere
- [ ] No unfilled `{{` tokens (build guard passes)
- [ ] No invented credentials, reviews, statistics, or prices
- [ ] Free inspection vs. paid testing stated correctly
- [ ] Amber used only for emergency elements
- [ ] Renders correctly at 360px, keyboard navigable, AA contrast

---

## 18. Parallel priority — flag to the client

The website is not the biggest constraint on lead flow right now. **There is no Google Business Profile.** For "mold removal near me" and every emergency water damage search, the map pack takes the majority of clicks before anyone reaches organic results.

Claim and verify the GBP as a service-area business — hidden address, five Treasure Valley cities — with primary category **Water Damage Restoration Service** and secondaries **Asbestos Testing Service** and **Mold Remediation**. Verification can take one to two weeks, so start it immediately rather than after launch.

Review generation should run in parallel with the build. At a $7,500 average ticket, the review gap costs more than anything on this site can recover.
