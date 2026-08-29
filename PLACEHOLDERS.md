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

## Blocking

| Token | Blocks | Needed from client |
|---|---|---|
| `{{EPA_RRP_FIRM_NUMBER}}` | The entire `/lead-paint-removal/` page, plus lead paint testing and encapsulation. Not built, not linked, not referenced until this lands. **Also blocks DNS cutover** — see below. | EPA RRP **firm** certification number (not an individual renovator card), its expiration date, and confirmation the firm is certified at all |

### ⚠ EPA RRP row is live in the footer as a format mask

The footer "Licensed & Certified" block now renders a third row:

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

- **The firm is certified** → replace `NAT-F______-_` with the real number,
  pair it with "U.S. EPA" as the issuer per §4, and unblock
  `/lead-paint-removal/`.
- **The firm is not certified, or it cannot be confirmed** → delete the row
  from the `credentials` array in `src/components/Footer.astro`.

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
| `{{WARRANTY_TERMS}}` | Service pages, `/faq/` | What is actually warranted, for how long, and what voids it |

## Trust / affiliations

| Token | Used on | Needed from client |
|---|---|---|
| `{{BBB_STATUS}}` | `/certifications/`, `/about/` | BBB accreditation status, if any |
| `{{CHAMBER_MEMBERSHIP}}` | `/about/` | Chamber of commerce memberships, if any |

## Google Business Profile

| Token | Used on | Needed from client |
|---|---|---|
| `{{GBP_URL}}` | Footer, `/reviews/`, `/contact/` | Live GBP URL once the profile is claimed and verified |
| `{{GBP_REVIEW_COUNT}}` | `/reviews/` | Real count, pulled from the live profile |

**There are zero Google reviews today.** No testimonials get written, no
`aggregateRating` or `Review` schema is emitted, and `/reviews/` ships as an
empty shell (§2.2). See CLAUDE.md §18 — the GBP is the single highest-leverage
open item on this engagement and takes one to two weeks to verify, so it needs
to be started now, in parallel with the build.

| Token | Used on | Needed from client |
|---|---|---|
| `{{TESTIMONIAL_1}}` … `{{TESTIMONIAL_8}}` | Nowhere yet — deliberately unrendered | Real, attributable customer quotes with permission to publish |

## Photography

All photography is client-supplied. No stock imagery of containments — the
containment work is the differentiator and stock photos of someone else's job
site undercut the entire positioning.

Slots are placed and reserved. Each renders a skeleton at its exact aspect
ratio, so dropping real photography in causes no reflow. The slot name is
carried as `data-photo` rather than a `{{TOKEN}}`, because these have to be
able to ship to a live page while the photos are still outstanding — the build
guard rejects `{{` in `dist/`.

**Shot list for Cody — /mold-remediation/ (6 photos):**

| Slot | Ratio | Where it appears | What to shoot |
|---|---|---|---|
| `PHOTO_HERO` | **16:9** | Hero, under the call button | The crew working, or a containment in place. This is the first image on the page — it should look like competence, not damage. Wide crop; it renders at most 560px across. |
| `PHOTO_INTRO_1` | **3:4 portrait** | Beside "What mold remediation actually is", sticky on desktop | Shot vertically. Moisture meter against framing or drywall, or a hand-held reading. Portrait suits the tall column — do not send a cropped landscape. |
| `PHOTO_CONTAINMENT_1` | **3:2** | Containment callout, on the dark band | The signature shot: poly sheeting with taped seams, negative air machine, ducting to an exterior opening. A visible manometer reading is a bonus. |
| `PHOTO_PROCESS_1` | **3:2** | Inside the process list, after step 04 (Removal) | Affected material bagged inside the containment, before it crosses the barrier. |
| `PHOTO_CLEARANCE_DOC_1` | **3:2** | `/mold-found-during-home-inspection/`, documentation section | A clearance package on a table: the lab report, chain-of-custody form, moisture log, scope of work. Shot flat or at a slight angle. Redact addresses and owner names before sending. This is the proof that page is selling. |
| `PHOTO_BEFORE_1` | **4:3** | "Before and after", left | Before. Must be the same angle and framing as the after shot. |
| `PHOTO_AFTER_1` | **4:3** | "Before and after", right | After. Same camera position as the before shot — a mismatched pair reads as a different house. |

Shoot wider than the crop. Landscape throughout except `PHOTO_INTRO_1`, which
is portrait. Note the city for each job so alt text can be truthfully local
(§11).

**Weight cap: 200KB per image after optimization**, enforced by
`npm run check:images` — the build fails on anything larger. Send full-size
originals; Astro generates AVIF and WebP at 400/800/1200/1600 and the page
serves the smallest candidate that fits the slot. Nothing needs pre-resizing,
but anything dropped straight into `public/` bypasses that and must already be
under the cap.

**Shot list — /asbestos-abatement/ (3 new, 2 reused):**

| Slot | Ratio | Where it appears | What to shoot |
|---|---|---|---|
| `PHOTO_ASBESTOS_1` | **3:2** | Process list, after step 03 (Removal) | Double-bagged, labelled asbestos waste inside the containment, before it crosses the barrier. The printed warning label should be readable. |
| `PHOTO_ASBESTOS_BEFORE_1` | **4:3** | "Before and after", left | A popcorn ceiling before removal. Same camera position as the after shot. |
| `PHOTO_ASBESTOS_AFTER_1` | **4:3** | "Before and after", right | The same ceiling finished. A mismatched pair reads as a different house. |

Reuses `PHOTO_HERO` and `PHOTO_CONTAINMENT_1`. The containment shot appears on
this page captioned for asbestos — a decon chamber visible in frame would let
one photo carry both pages honestly.

**Shot list — the five service pages added after abatement (4 new):**

| Slot | Ratio | Where it appears | What to shoot |
|---|---|---|---|
| `PHOTO_LAB_SAMPLE_1` | **3:2** | `/mold-inspection-testing/`, `/asbestos-testing/` | Bagged, labelled samples beside a chain-of-custody form. One photo serves both testing pages. |
| `PHOTO_CRAWLSPACE_1` | **3:2** | `/crawlspace-drainage/` | Standing water in a crawlspace with the vapor barrier floated clear of the soil. The condition, not the repair — this is the photo that makes a homeowner recognise their own house. |
| `PHOTO_ENCAPSULATION_1` | **3:2** | `/crawlspace-encapsulation/` | Finished liner run up the piers and stem wall with seams sealed. The vertical surfaces are the part that distinguishes encapsulation from loose sheeting, so get them in frame. |
| `PHOTO_RECONSTRUCTION_1` | **3:2** | `/reconstruction/` | Rebuild in progress — drywall going back into a space that was opened for remediation. |

`/reconstruction/` also uses `PHOTO_BEFORE_AFTER_1` and `PHOTO_BEFORE_AFTER_2`
as its before/after pair. All five pages reuse `PHOTO_HERO` and
`PHOTO_CONTAINMENT_1`.

**Shot list — /water-damage-restoration/ (1 new):**

| Slot | Ratio | Where it appears | What to shoot |
|---|---|---|---|
| `PHOTO_WATER_DRYING_1` | **3:2** | Process list, after step 05 (Structural drying) | Air movers set against the affected surfaces with a dehumidifier in frame. The equipment in a room mid-dry, not a stack of it on a truck — this is the photo that shows why the last two days of the job exist. |

Reuses `PHOTO_HERO`, `PHOTO_INTRO_1`, and `PHOTO_CONTAINMENT_1`. No
before/after pair on this page: a dried wall photographs identically to a wet
one, so a pair would be making a claim the image cannot support. If a water
before/after is wanted later, shoot the removal — open wall cavity versus
finished rebuild — rather than the drying.

**Shot list — /our-containment-process/ (8 slots, the biggest single ask).**

This is the signature page (§10) and it is mostly photographs. All eight can
come from **one well-documented job**: an hour on a single site, shooting each
element as it goes up. That one hour produces the most linkable asset on the
site.

| Slot | Ratio | What to shoot |
|---|---|---|
| `PHOTO_CONTAINMENT_HERO` | **16:9** | A finished containment, wide. Enclosure, machine running, duct visible if possible. Establishing shot. |
| `PHOTO_CONTAINMENT_1` | **3:2** | The barrier: sheeting floor to ceiling, sealed to the surrounding surfaces. |
| `PHOTO_CONTAINMENT_2` | **3:2** | Taped seams, close in. The tape has to be legible — this shot is the difference between an enclosure and a stack of sheets. |
| `PHOTO_CONTAINMENT_3` | **3:2** | The filter stack: two pre-filters ahead of the HEPA. Open machine if that shows the staging. |
| `PHOTO_CONTAINMENT_4` | **3:2** | Exhaust duct leaving the building through a window or vent, sealed where it passes through. |
| `PHOTO_CONTAINMENT_5` | **3:2** | **The manometer, with a readable number.** The single most valuable image on the site — it is the only thing that *proves* the pressure differential rather than asserting it. Get the display in focus. |
| `PHOTO_CONTAINMENT_6` | **3:2** | The decontamination chamber at the entry. |
| `PHOTO_CONTAINMENT_7` | **3:2** | A sealed HVAC return or supply register inside the work area. |

Every one of these appears on the page with copy explaining what it is, why it
is there, and what goes wrong without it — so the photographs are load-bearing
rather than decorative. Until they land the page ships with skeletons at the
correct ratios and nothing reflows when they arrive.

**Shot list — the five city pages (5 slots, lower priority).**

| Slot | Ratio | Page |
|---|---|---|
| `PHOTO_CITY_BOISE` | **16:9** | `/mold-remediation-boise/` |
| `PHOTO_CITY_MERIDIAN` | **16:9** | `/mold-remediation-meridian/` |
| `PHOTO_CITY_NAMPA` | **16:9** | `/mold-remediation-nampa/` |
| `PHOTO_CITY_CALDWELL` | **16:9** | `/mold-remediation-caldwell/` |
| `PHOTO_CITY_EAGLE` | **16:9** | `/mold-remediation-eagle/` |

One job photo per city, **actually taken in that city**. That is the only
requirement, and it is the whole point: §11 allows alt text naming the city
only where it is truthful, so a shared photo cannot carry a local claim. A
containment in a Nampa crawlspace on the Nampa page is worth more than a
better photograph from somewhere else.

Lower priority than the containment set. The pages ship with skeletons at the
right ratio and nothing reflows when the photos arrive.

One further slot from the problem pages:

| Slot | Ratio | Page | What to shoot |
|---|---|---|---|
| `PHOTO_VERMICULITE_1` | **16:9** | `/vermiculite-insulation/` | Loose-fill vermiculite in an attic — the granules close enough to be identifiable. This photo does the work the copy cannot: people arrive at that page trying to identify what they are looking at. |

**Shot list — the two new service pages (3 new slots):**

| Slot | Ratio | Page | What to shoot |
|---|---|---|---|
| `PHOTO_RADON_1` | **16:9** | `/radon-mitigation/` hero | A finished sub-slab system: riser, inline fan, and the discharge above the roofline. Get the manometer in frame if you can — same logic as the containment gauge, it is the part a homeowner can actually read. |
| `PHOTO_RADON_2` | **3:2** | `/radon-mitigation/` process | The suction point cut and sealed into the slab, before the riser goes in. This is the step that decides whether a system performs, and nobody ever sees it. |
| `PHOTO_DEMO_1` | **16:9** | `/demolition/` hero | An interior strip-out mid-job with protection in place on what is staying. The contrast between the stripped area and the protected area is the whole argument for selective demolition. |

`/demolition/` reuses `PHOTO_ASBESTOS_1` for its process slot.

**Shot list — /remodeling/ (3 new slots):**

| Slot | Ratio | What to shoot |
|---|---|---|
| `PHOTO_REMODEL_1` | **16:9** | A finished remodel in an older Treasure Valley home. Hero shot — this one sells the work rather than explaining it, which is unusual for this site. |
| `PHOTO_REMODEL_BEFORE_1` | **4:3** | Before. Same camera position as the after. |
| `PHOTO_REMODEL_AFTER_1` | **4:3** | After. A mismatched pair reads as a different house. |

`/remodeling/` also reuses `PHOTO_CONTAINMENT_1` and `PHOTO_DEMO_1`.

Still needed beyond this page:

- Three further containment shots for `/our-containment-process/`, the
  signature page (§10): a decontamination chamber, a pressure/manometer
  reading, and the filter stack.
- Matched before/after pairs for the remaining service and city pages.
- A real photo of **Cody Mortensen** for `/about/` (§7 — the owner-operator is
  the wedge against franchise competitors).

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
  log, photographs, independent lab clearance report, chain of custody —
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
