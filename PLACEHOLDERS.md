# Placeholders — open items awaiting real values

Every unknown value on this site is emitted as a `{{TOKEN}}` and tracked here.
**Nothing is ever guessed.** This is a YMYL vertical; an invented credential
number is a regulatory problem, not a copy problem (CLAUDE.md §2).

The build guard (`npm run check:placeholders`) greps `dist/` for `{{` and
fails the build if any token reaches production output. A token is therefore
either filled in with a real value, or the element that would render it is
suppressed — see the `isPlaceholder()` filter in `src/components/Footer.astro`
for the pattern.

---

## Confirm with Cody before DNS cutover

These are live on staging as written. Each needs a yes/no from Cody before
`envirotechidaho.com` points at the site, because each one is a claim a
customer or a buyer's agent can hold the company to.

- [ ] **Independent lab clearance report: every job, or only when the buyer requires it?**
  The pages disagree. `/mold-remediation/` says clearance testing happens
  "where the job calls for it". `/mold-found-during-home-inspection/` reads as
  if every job ends with an independent lab clearance report. Whichever is
  true, make both pages say it.
- [ ] **Moisture readings and chain-of-custody paperwork: does he provide these?**
  Both are promised in the documentation list and the FAQ on
  `/mold-found-during-home-inspection/`. Moisture readings are also a scope
  item on `/mold-remediation/`.
- [ ] **"Third-party clearance" in the trust strip.** `TRUST_STRIP` in
  `src/data/service-defaults.ts` ("An independent lab signs off, not us")
  renders on every service page and every city page, including asbestos,
  radon, and demolition. If clearance is not on every job, this needs
  rewording or removing.
- [ ] **Radon mitigation: does he actually offer it?** `/radon-mitigation/` is
  live and linked from the nav, and its certification is already flagged
  unverified under Credentials below. If he does not offer it, unpublish the
  page and remove it from `nav.json` and `link-map.json`.
- [ ] **OK to show crew faces?** Every photo with a visible face was held back
  (manifest privacy flags: IMG_0072, IMG_2241, IMG_2245, IMG_3467, IMG_3712,
  `5-Mar 09…6iYo.jpg`, video IMG_3282). Several are the strongest
  crew-in-containment shots available. Also confirm whether everyone pictured
  has agreed.

---

## Blocking

| Token | Blocks | Needed from client |
|---|---|---|
| `{{EPA_RRP_FIRM_NUMBER}}` | Nothing structural any more — `/lead-paint-removal/` is built and linked. What it blocks is the *claim*: the number renders sitewide as a visible mask and cannot be asserted until this lands. **Blocks DNS cutover** — see below. | EPA RRP **firm** certification number (not an individual renovator card), its expiration date, and confirmation the firm is certified at all |

### ⚠ /lead-paint-removal/ is live and the certification behind it is unconfirmed

The page is built, linked in the primary nav, and describes lead paint work as
a service Enviro-Tech performs. The EPA RRP firm number is still outstanding.

Its credentials section renders the mask below with a **"Pending verification"**
marker, and the page copy says plainly that the digits are not published yet
and points the reader at EPA's own firm search rather than at anything we hand
them. `verified: false` in `src/data/credentials.ts` keeps the mask out of
structured data on every page — `check-nav.mjs` fails the build if it ever
reaches a JSON-LD block, and fails it again if the value stops being a mask
while `verified` is still false.

**Two things still contradict each other and only the client can settle it.**
`/certifications/` lists EPA RRP under the heading *"What we are not certified
to do"* with the badge **"Not currently held"**, because that is what
`verified: false` means there. The site therefore sells lead paint removal on
one page and states it is not certified for it on another. That was accurate
while the page did not exist. It is not a state to launch in.

Resolve before cutover, in this order:

1. **Ask whether the firm actually holds EPA RRP certification**, which is a
   different question from whether anyone has found the number. §4 has the
   status as unconfirmed rather than merely missing.
2. **If it is held** → put the real number in `credentials.ts`, set
   `verified: true`, record `lastVerified`, and the credential moves itself out
   of the "not certified" section on `/certifications/` and into structured
   data. No other file changes.
3. **If it is not held, or cannot be confirmed** → `/lead-paint-removal/` comes
   down or is rewritten to describe work the firm may lawfully perform, and the
   EPA RRP row comes out of the footer. Certification is a legal precondition
   for the work under 40 CFR Part 745, not a trust badge.

### The footer row

The footer "Licensed & Certified" block renders a third row:

```
EPA RRP Firm Certification
NAT-F______-_
```

The underscores are the unfilled digits. The value is a **visible format
mask, not a number** — it is deliberately not a `{{TOKEN}}`, because the
`isPlaceholder()` filter in `src/components/Footer.astro` strips tokenised
rows and the row would not render at all. The build guard therefore passes.

**This must not reach the production domain unverified.** The mask invents no
number, but the row itself asserts that Enviro-Tech holds EPA RRP firm
certification, and §4 has that status as unconfirmed rather than merely
missing. EPA RRP firm certification is a federal requirement under 40 CFR
Part 745 for disturbing lead paint in pre-1978 housing; of every credential in
the §4 table this is the one where an unfounded claim is a regulatory problem
rather than a copy problem, which is exactly what §2.1 exists to prevent.

Before DNS cutover (build order step 12), one of these has to happen:

- **The firm is certified** → replace `NAT-F______-_` with the real number in
  `src/data/credentials.ts` and set `verified: true`. The footer, the
  `/lead-paint-removal/` credentials section, `/certifications/`, and the
  structured data all read from that one entry.
- **The firm is not certified, or it cannot be confirmed** → delete the entry
  from `CREDENTIALS` in `src/data/credentials.ts` and take
  `/lead-paint-removal/` down with it.

## Credentials

### ⚠ Radon certification is unverified and /radon-mitigation/ is live

`/radon-mitigation/` describes radon mitigation as a service Enviro-Tech
performs. §4 lists no radon credential, and the page currently makes no
certification claim at all — which is the only reason it is not a §2.1
problem today.

**Confirm before DNS cutover:** does Cody hold NRPP or NRSB certification for
radon mitigation, and does Idaho require any registration to perform it?
Radon mitigation is a trade where certification is the industry norm and where
buyers, agents, and lenders routinely ask. Selling it without one is a
different kind of exposure than the page currently acknowledges.

| Token | Used on | Needed from client |
|---|---|---|
| `{{RADON_CERT}}` | `/radon-mitigation/`, `/certifications/`, footer | NRPP or NRSB certification number and holder, or confirmation that none is held |

If no certification is held, the honest options are to state that plainly, to
partner with a certified mitigator, or to take the page down. Do not add a
credential line to the page without a real number behind it.


| Token | Used on | Needed from client |
|---|---|---|
| `{{CMR_ISSUING_ORG}}` | Footer credential row, `/certifications/` | Which body issued `CMR0000023347`. The number is confirmed; the issuer is not. §4 requires every number to be paired with its issuer — an unpaired number reads as weak. |
| `{{IICRC_CERT}}` | Footer, `/certifications/` | IICRC certification number(s), which designations (WRT, AMRT, ASD…), and who holds them |
| `{{LIABILITY_COVERAGE_AMOUNT}}` | Footer, `/certifications/`, `/for-realtors/` | General liability coverage limit and carrier |
| `{{WORKERS_COMP_STATUS}}` | Footer, `/certifications/`, `/commercial/` | Workers' comp carrier and policy status |
| ~~`{{WARRANTY_TERMS}}`~~ **Filled** | `/mold-remediation/` (scope list + FAQ), `/mold-found-during-home-inspection/` | From Cody's completion letter: 2-year guarantee of no mold regrowth on treated interior areas, transferable with the house. Void if the treated areas are modified, or if a new or existing moisture source is found in or around them. **Mold remediation only.** Do not attach it to asbestos, lead, demolition, or any other service, and do not put it in shared blocks (trust strip, service defaults, footer). |

### ⚠ /certifications/ is live and three facts are missing from it

The page renders entirely from `src/data/credentials.ts`, so filling these in
updates the page, the footer, and the structured data at once.

| Needed | Why it blocks the page specifically |
|---|---|
| `{{CMR_ISSUING_ORG}}` | This is now the page's weakest point. `/certifications/` promises the reader a verification route for every credential and cannot supply one for `CMR0000023347`, because nobody knows which body issued it. The page says so plainly rather than guessing — but that admission sits directly under the number. Highest-value single fact on this list. |
| `lastVerified` dates | §4 wants a "last verified" date per credential. No date has ever been recorded, so the field is unset on every entry and the line does not render. Check each credential against its issuer, then add `lastVerified: "YYYY-MM-DD"`. |
| `{{RADON_CERT}}` / `{{RADON_CERT_BODY}}` | `/radon-mitigation/` sells the service; `/certifications/` currently lists radon certification under "not currently held". If Cody holds NRPP or NRSB, add the number and the body. If he does not, that section is already accurate and the radon page needs revisiting. |

**No verification link exists for Idaho asbestos contractor certification.**
Researched and could not confirm one: Idaho DEQ handles asbestos NESHAP
notification for major facilities and EPA Region 10 covers everything else, so
DEQ's page is linked as the notification requirements rather than presented as
a contractor lookup. If a state-level asbestos certification registry does
exist, add it — but it must be a `.gov` source. Third-party license-lookup
directories are not acceptable on this page at any point.

## Trust / affiliations

| Token | Used on | Needed from client |
|---|---|---|
| `{{BBB_STATUS}}` | `/certifications/`, `/about/` | BBB accreditation status, if any |
| `{{CHAMBER_MEMBERSHIP}}` | `/about/` | Chamber of commerce memberships, if any |

## Google Business Profile

| Token | Used on | Needed from client |
|---|---|---|
| `{{GBP_URL}}` | Footer, `/reviews/`, `/contact/`, **and `sameAs` in structured data on all 34 pages** | Live GBP URL once the profile is claimed and verified. Add it to `SAME_AS` in `src/data/organization.ts` — it is an empty array today, so `sameAs` is omitted rather than emitted empty, and one edit populates every page |
| `{{GBP_REVIEW_COUNT}}` | `/reviews/`, and the homepage testimonial band's header line | Real count, pulled from the live profile. The band currently reads "Reviews pending" rather than a number, because a count is the one thing on it that cannot be a placeholder — a wrong number is a claim, where an obvious stub is not |
| `{{TESTIMONIALS}}` | Homepage testimonial band (`src/data/testimonials.ts`) | Real quotes with permission to publish, each with a first name and city. Fills the `TESTIMONIALS` array; the placeholder array next to it then gets deleted |

### ⚠ The homepage testimonial band is layout scaffolding

`src/components/TestimonialBand.astro` renders six stub tiles between the hero
and the services grid. **Every quote is prefixed `[PLACEHOLDER]`**, every
attribution is "Sample Name", and the header reads "Reviews pending" rather
than a count. It exists so the layout can be judged before any content exists.

It cannot reach the live domain, by two independent mechanisms:

1. **The component removes itself.** It renders real testimonials when
   `TESTIMONIALS` has entries, the stubs only while `STAGING_NOINDEX` is true,
   and nothing at all otherwise. Flip the flag for cutover and the band
   disappears rather than shipping stubs.
2. **The build fails.** `check-structure.mjs` rejects `[PLACEHOLDER]` anywhere
   in `dist/` once `STAGING_NOINDEX` is false. While it is true the stubs are
   allowed and the check prints a note naming the pages.

Both were verified by forcing the stubs into a production build; the guard
fails it. `Review` and `aggregateRating` schema are separately rejected on
every page, so the band emits neither.

**To go live with real reviews:** fill `TESTIMONIALS` in
`src/data/testimonials.ts`, delete `PLACEHOLDER_TESTIMONIALS`, and the header
switches itself from "Reviews pending" to "What customers say". **To go live
without them:** do nothing — the band is already absent from a production
build.

**There are zero Google reviews today.** No testimonials get written, no
`aggregateRating` or `Review` schema is emitted, and `/reviews/` ships as an
empty shell (§2.2). See CLAUDE.md §18 — the GBP is the single highest-leverage
open item on this engagement and takes one to two weeks to verify, so it needs
to be started now, in parallel with the build.

| Token | Used on | Needed from client |
|---|---|---|
| `{{TESTIMONIAL_1}}` … `{{TESTIMONIAL_8}}` | Nowhere yet — deliberately unrendered | Real, attributable customer quotes with permission to publish |

## Photography

All photography is client-supplied. No stock imagery of containments: the
containment work is the differentiator, and stock photos of someone else's job
site undercut the entire positioning. No photo is reused on a page whose claim
it cannot support (a city page gets a photo actually taken in that city).

**An unfilled slot renders nothing.** No skeleton, no caption, no grey box.
Where a slot sits in a two-column layout, the layout drops to a single text
column instead of leaving an empty half. A before/after section renders only
when **both** halves are filled. Filling a slot is data only: add `src:` and
`alt:` to the slot in the page's `.md` file and the photo appears.

The slot name is carried as `data-photo` rather than a `{{TOKEN}}`, because the
build guard rejects `{{` in `dist/`.

**How photos are added.** Source files live in `src/assets/photos/`, named
`{service}-{subject}-{city}-{n}.webp` (city only when the job's GPS confirms
it). Each is a hand-cropped 1600px WebP with an 800px variant beside it, with
**all EXIF/GPS metadata stripped**: the originals carry customer locations.
Astro generates AVIF/WebP/JPEG at 400/800/1200/1600 from the 1600px source.
Source of truth for what each photo shows, where it was taken, and its privacy
flag: `~/Desktop/Photos/Enviro-Tech/Job Photos/manifest.csv`.

**Weight cap: 200KB per image after optimization**, enforced by
`npm run check:images`; the build fails on anything larger. A busy photo can
exceed it at the 1600px JPEG fallback; re-export the source slightly softer.

### Filled

| Slot | Page | File | Photo |
|---|---|---|---|
| `PHOTO_CONTAINMENT_HERO` | `/our-containment-process/` | `negative-pressure-containment-sealed-room-1` | IMG_6785, sealed room, poly floor, scrubber |
| `PHOTO_CONTAINMENT_1` | `/our-containment-process/` | `negative-pressure-containment-poly-barrier-1` | IMG_8901, floor-to-ceiling poly in a kitchen |
| `PHOTO_CONTAINMENT_2` | `/our-containment-process/` | `negative-pressure-containment-taped-seams-1` | IMG_0824, red-taped ceiling seam |
| `PHOTO_CONTAINMENT_4` | `/our-containment-process/` | `negative-pressure-containment-exhaust-duct-window-1` | IMG_3710, duct through a sealed window |
| `PHOTO_CONTAINMENT_6` | `/our-containment-process/` | `asbestos-abatement-decon-chamber-1` | IMG_0093, decon chamber with asbestos sign |
| `PHOTO_CONTAINMENT_7` | `/our-containment-process/` | `negative-pressure-containment-hvac-return-sealed-1` | IMG_1328, taped return grille |
| `PHOTO_CONTAINMENT_5` | `/our-containment-process/` | `negative-pressure-containment-poly-drawn-inward-1` | IMG_8176, doorway poly drawn inward toward the work area |
| `PHOTO_HERO` | `/mold-found-during-home-inspection/` only | `negative-pressure-containment-zip-wall-kitchen-1` | IMG_3469, enclosure beside kitchen ovens |
| `PHOTO_CONTAINMENT_1` | `/mold-found-during-home-inspection/` only | `negative-pressure-containment-basement-air-scrubber-1` | IMG_3711, basement zip-wall and scrubber |
| `PHOTO_CITY_BOISE` | `/mold-remediation-boise/` | `negative-pressure-containment-zip-wall-boise-1` | `6-Mar 09…uLw6.jpg`, GPS Boise |
| `PHOTO_CITY_CALDWELL` | `/mold-remediation-caldwell/` | `water-damage-restoration-subfloor-drying-caldwell-1` | IMG_9633, GPS Caldwell |

Slot names are per page, not per photo: `PHOTO_HERO` and `PHOTO_CONTAINMENT_1`
appear on many pages and are filled independently in each page's entry. Every
page not listed above still has them empty, including every service page
(which take `PHOTO_CONTAINMENT_1` from `src/data/service-defaults.ts`).

### Still empty: /our-containment-process/

| Slot | Ratio | What to shoot |
|---|---|---|
| `PHOTO_CONTAINMENT_3` | **3:2** | The filter stack: two pre-filters ahead of the HEPA. Open machine so the staging is visible. The caption makes that claim, so a closed machine does not fill it. |

### Still empty: /mold-remediation/ and the service pages

| Slot | Ratio | Where it appears | What to shoot |
|---|---|---|---|
| `PHOTO_HERO` | **16:9** | Hero, under the call button (every service page) | The crew working, or a containment in place. Wide crop; renders at most 560px across. |
| `PHOTO_INTRO_1` | **3:4 portrait** | Beside the intro, sticky on desktop | Shot vertically. Moisture meter against framing or drywall. |
| `PHOTO_CONTAINMENT_1` | **3:2** | Containment callout, on the dark band (every service page) | Poly sheeting with taped seams, negative air machine, ducting to an exterior opening. |
| `PHOTO_PROCESS_1` | **3:2** | `/mold-remediation/`, after step 04 | Affected material bagged inside the containment, before it crosses the barrier. |
| `PHOTO_BEFORE_1` / `PHOTO_AFTER_1` | **4:3** | `/mold-remediation/` before/after | Same angle and framing both times. Section is hidden until both exist. |
| `PHOTO_ASBESTOS_1` | **3:2** | `/asbestos-abatement/`, `/demolition/` | Double-bagged, labelled asbestos waste inside the containment, label readable. |
| `PHOTO_ASBESTOS_BEFORE_1` / `_AFTER_1` | **4:3** | `/asbestos-abatement/`, `/popcorn-ceiling-asbestos/` | A popcorn ceiling before and after, same camera position. Candidate pair on file (IMG_6414 → IMG_6444, school slab) was not approved. |
| `PHOTO_LAB_SAMPLE_1` | **3:2** | `/mold-inspection-testing/`, `/asbestos-testing/`, two problem/audience pages | Bagged, labelled samples beside a chain-of-custody form. |
| `PHOTO_CRAWLSPACE_1` | **3:2** | `/crawlspace-drainage/`, `/black-mold-in-crawl-space/` | Standing water in a crawlspace, barrier floated clear of the soil. |
| `PHOTO_ENCAPSULATION_1` | **3:2** | `/crawlspace-encapsulation/` | Finished liner up the piers and stem wall, seams sealed. |
| `PHOTO_RECONSTRUCTION_1` | **3:2** | `/reconstruction/` | Drywall going back into a space opened for remediation. |
| `PHOTO_BEFORE_AFTER_1` / `_2` | **4:3** | `/reconstruction/` | Matched pair. |
| `PHOTO_WATER_DRYING_1` | **3:2** | `/water-damage-restoration/`, after step 05 | Air movers against affected surfaces with a dehumidifier in frame. |
| `PHOTO_RADON_1` | **16:9** | `/radon-mitigation/` hero | Finished sub-slab system: riser, inline fan, discharge above the roofline, manometer in frame. |
| `PHOTO_RADON_2` | **3:2** | `/radon-mitigation/` process | The suction point cut and sealed into the slab. |
| `PHOTO_DEMO_1` | **16:9** | `/demolition/`, `/remodeling/` | Interior strip-out with protection on what is staying. |
| `PHOTO_LEAD_1` | **16:9** | `/lead-paint-removal/` hero | Interior prep on a pre-1978 home, work area sealed. |
| `PHOTO_LEAD_2` | **3:2** | `/lead-paint-removal/` process | A painted component removed whole and wrapped inside the containment. |
| `PHOTO_REMODEL_1` | **16:9** | `/remodeling/` hero | A finished remodel in an older Treasure Valley home. |
| `PHOTO_REMODEL_BEFORE_1` / `_AFTER_1` | **4:3** | `/remodeling/` | Matched pair. |

### Still empty: problem and audience pages

| Slot | Ratio | Page(s) | What to shoot |
|---|---|---|---|
| `PHOTO_CLEARANCE_DOC_1` | **3:2** | `/mold-found-during-home-inspection/`, `/for-realtors/`, `/for-property-managers/`, `/does-homeowners-insurance-cover-mold/` | A clearance package on a table: scope, moisture log, chain-of-custody form, the independent lab's clearance report, and our completion certificate. Redact addresses and owner names. |
| `PHOTO_VERMICULITE_1` | **16:9** | `/vermiculite-insulation/` | Loose-fill vermiculite in an attic, granules identifiable. Candidate on file (`2-Apr 10…mrA3.jpg`, Twin Falls) needs Cody to confirm it is vermiculite. |
| `PHOTO_CONTAINMENT_HERO` | **16:9** | `/commercial/` | A commercial containment, wide. |

### Still empty: city pages (slot hidden until filled)

| Slot | Page | Status |
|---|---|---|
| `PHOTO_CITY_MERIDIAN` | `/mold-remediation-meridian/` | No GPS-confirmed Meridian photo exists. |
| `PHOTO_CITY_NAMPA` | `/mold-remediation-nampa/` | No GPS-confirmed Nampa photo exists. |
| `PHOTO_CITY_EAGLE` | `/mold-remediation-eagle/` | None. Four photos (job-34) geocode to unincorporated Boise County near Avimor, not Eagle; they cannot carry an Eagle claim. |

One job photo per city, **actually taken in that city**, confirmed by GPS or by
Cody. Only 40 of the 201 photos supplied so far carry GPS. Turning on location
for the camera on the next Meridian, Nampa, and Eagle jobs is the fastest fix.

### Still needed beyond the slots

- A real photo of **Cody Mortensen** for `/about/` (§7). The page is not built
  yet. One low-confidence candidate (IMG_2068, attic selfie in a respirator)
  needs Cody to confirm it is him.
- Photos with privacy flags were held back (faces, a teacher's name sign).
  They need approval or a crop before they can be used.

## Scope

| Token | Blocks | Needed from client |
|---|---|---|
| `{{DOES_NOT_DO}}` | Sewage and biohazard cleanup. Not advertised anywhere until resolved. | Confirm whether the company takes sewage / biohazard work, and if not, what it refers out |

---

## Not a placeholder, but still open

- **`LEAD_WEBHOOK_URL` is not set.** The lead Worker validates, rate-limits,
  and forwards, but `/api/lead` returns `500 not_configured` until the secret
  exists, and the form shows its "call us" fallback. Set it with:

  ```
  npx wrangler secret put LEAD_WEBHOOK_URL
  ```

  Point it at whatever receives leads — Zapier, Make, n8n, a CRM endpoint —
  and have that destination email `office@envirotechidaho.com`. Optionally set
  `LEAD_WEBHOOK_TOKEN` too; it is sent as `X-Lead-Token` if the receiver wants
  to authenticate the caller.

  **The receiving end must be durable.** Nothing identifying is logged, by
  design, so a lead that fails delivery cannot be recovered afterwards. The
  Worker retries once and then tells the customer to phone, but the webhook
  target should have its own retry or queue rather than dropping on error.

  Payload is JSON: `name`, `phone`, `email`, `city`, `service`, `details`,
  `sourcePath`, `sourceUrl`, `receivedAt`, `receivedAtLocal`, `requestId`.

- **`STAGING_NOINDEX` in `src/data/site.ts` is `true`.** Every page emits
  `<meta name="robots" content="noindex">` while the site is on workers.dev,
  because the canonical already points at `https://envirotechidaho.com` and an
  indexed staging copy would either duplicate the real domain or give Google a
  canonical to a page that does not exist. **Set to `false` at DNS cutover** —
  leaving it on means the launched site is invisible to search, which is the
  worst possible failure mode for this project.
- **Sample clearance package.** `/mold-found-during-home-inspection/` tells
  the reader they can see a sample before booking, and the FAQ repeats the
  offer. Right now that is answered by phone or the form. Ask Cody for a
  redacted clearance package from a completed job — scope of work, moisture
  log, photographs, independent lab clearance report, chain of custody, our completion certificate —
  with address and owner details removed.

  Once it exists, host it and add a `cta` to that section's entry:

  ```yaml
  cta:
    label: See a sample clearance package
    href: /sample-clearance-package.pdf
  ```

  The layout renders that button only when `cta` is present, so the page never
  points at an asset that does not exist. Nothing else needs changing.

  This is the single highest-leverage asset on the list. It is the exact
  document a buyer's agent asks for, and being able to show one before the
  job is booked answers the objection that page exists to answer.
- **`/og-default.jpg` does not exist — social cards have no image.** Every
  page emits Open Graph and Twitter tags, but `og:image` and `twitter:image`
  are **omitted** rather than pointing at a missing file, because a broken
  og:image is worse than none: scrapers cache the failure. `twitter:card`
  currently degrades to `summary` and becomes `summary_large_image`
  automatically once the asset lands.

  Needs a **1200×630 JPEG** at `public/og-default.jpg`. Logo on `--ink`, or a
  containment photo with the wordmark — it is what every shared link renders
  as, including anything a realtor forwards to a client. Drop the file in and
  every page picks it up with no code change.

- **The favicon is still Astro's scaffold logo.** `public/favicon.svg` is the
  default mark that shipped with the framework, not Enviro-Tech's. Needs a real
  favicon derived from the logo: `favicon.svg`, a 32×32 `favicon.ico`, and a
  180×180 `apple-touch-icon.png`. Low effort, and currently every browser tab
  and bookmark shows another company's logo.

- **⚠ The privacy policy discloses analytics and pixels that are not installed.**
  `/privacy-policy/` names Google Analytics, Google Tag Manager, Meta Pixel,
  and the Meta Conversions API. **None of them are on the site today** —
  verified zero occurrences of `gtag`, `GTM-`, `fbq`, or `connect.facebook`
  anywhere in `dist/`.

  That ordering is deliberate and it is the correct one: you disclose before
  you collect, and Meta's lead ad review expects the disclosure to exist before
  the pixel runs. But the two must ship together. **At cutover, either install
  those tags or strike those clauses** — a policy describing collection that
  never happens is inaccurate in the other direction, and the Conversions API
  in particular is server-side work that has not been scoped.

  Same applies to the cookies section, which describes cookies set by those
  tools. The site currently sets none of its own.

- **Privacy policy: data retention period is unstated.** The policy says job
  records are kept and that submitted information can be deleted on request,
  but not for how long lead data is retained in Make or in the client's inbox.
  Confirm the actual practice and add a sentence, rather than picking a number
  that sounds reasonable.

- **Privacy policy effective date is 29 August 2026.** If the analytics stack
  or the form pipeline changes before cutover, update the date with the
  content — it is in `src/pages/privacy-policy.astro` as a single `EFFECTIVE`
  constant.

- **GTM container `GTM-N9GZF7W7`** exists on the current Wix site. Confirm
  whether it is still in use before carrying it over (§16).
- **Full Wix URL list.** Required before decommissioning, for 301 mapping in
  `_redirects` (§16). Known so far: `/`, `/certifications`, `/services`.
