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

- [ ] **Permission to publish the third-party air-sample photo.**
  `mold-testing-air-sample-nampa-1.webp` on `/mold-inspection-testing/`
  shows the independent testing company's pump and cassette. Confirm the
  photo is ours to use (who took it) and that the tester is fine with
  their equipment appearing on the site.
- [ ] **Independent lab clearance report: every job, or only when the buyer requires it?**
  Both mold pages now take the hedged position: clearance testing by an
  independent lab *when the buyer or the job calls for it*
  (`/mold-remediation/` scope list, `/mold-found-during-home-inspection/`
  throughout). If Cody confirms it runs on every mold job, the hedge can be
  lifted and the stronger claim restored. AGENTS.md already records it as
  confirmed for **asbestos** final clearance.
- [ ] **Moisture readings and chain-of-custody paperwork: does he provide these?**
  Both are promised in the documentation list and the FAQ on
  `/mold-found-during-home-inspection/`. Moisture readings are also a scope
  item on `/mold-remediation/`.
- [ ] **"Third-party clearance" in the trust strip: removed pending confirmation.**
  `TRUST_STRIP` in `src/data/service-defaults.ts` now carries two items
  (licensed, 24/7). It renders on every service, city, problem, and audience
  page and the homepage, so it cannot make a claim that only holds for some
  services. If Cody confirms clearance on every job, restore
  `{ label: "Third-party clearance", detail: "An independent lab signs off, not us" }`.
  The strip lays out one column per item, so no CSS change is needed either way.
- [ ] **"Available 24/7" in the trust strip: does someone actually answer at any hour?**
  It renders on every page that carries the strip, beside the phone number,
  and the hero and CTA bar repeat it ("Someone answers 24/7"). If the phone
  goes to voicemail overnight, this is the claim a customer tests first.
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

### ⚠ /lead-paint-removal/ is hidden until it is rewritten and the firm cert is confirmed

**Current state (hidden, not deleted).** The page still builds and the URL
still resolves, but it is out of the nav (`"built": false` in `nav.json`, which
also drops it from the homepage grid and every related-links list), removed
from `link-map.json`, excluded from the sitemap (`astro.config.mjs`), and
renders `noindex` (`noindex: true` in its entry).

**What is confirmed.** Cody Mortensen holds an **individual** EPA RRP Certified
Renovator certification (#R-I-18955-25-00009, Industrial Hygiene Resources,
Ltd., current through 2030-04-24). It is in `credentials.ts` and on
`/certifications/`, the footer, and structured data (on Cody's `Person` node,
not the business). **The firm certification is not confirmed.** It stays a
visible `NAT-F______-_` mask with `verified: false`, labelled "Pending
confirmation", and nothing on the site may imply the firm holds it.

**Before restoring the page, all of these must be true:**

1. **EPA RRP firm certification is confirmed.** Put the real `NAT-F…` number in
   `credentials.ts`, set `verified: true`, and record `lastVerified`. The RRP
   rule requires the firm to be certified, not only the renovator. Certification
   is a legal precondition for the work under 40 CFR Part 745, not a trust badge.
2. **The page is rewritten as lead-safe renovation (RRP), not removal or
   abatement.** Lead abatement is a separate federal discipline with its own
   certification, which nobody has confirmed. That means a new title, H1, meta
   description, `serviceType`, and slug (for example
   `/lead-safe-renovation/`), with the copy describing renovation work done
   under lead-safe practices. Add a redirect from `/lead-paint-removal/`.
   Update the credentials block's `show` list to include
   `EPA RRP Certified Renovator`.
3. Then flip `built: true` in `nav.json`, restore the `link-map.json` entry and
   keywords under the new slug, remove the sitemap exclusion, and drop
   `noindex: true`.

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
number, and the row now carries a **"Pending confirmation"** marker beside it
(any `verified: false` credential gets one). The row still names the
credential, though, and §4 has its status as unconfirmed rather than merely
missing. The individual Certified Renovator row above it is confirmed and is
a different credential; it does not stand in for the firm's. EPA RRP firm certification is a federal requirement under 40 CFR
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

### Renewal dates

| Credential | Holder | Number | Current through | Action |
|---|---|---|---|---|
| AHERA Asbestos Abatement Contractor/Supervisor (annual refresher) | Cody Mortensen | 7593-02, Industrial Hygiene Resources, Ltd. | **2027-06-16** | Set a reminder for **2027-04-16**. After renewal, update `value` and `currentThrough` in `src/data/credentials.ts`: the trust strip, footer, `/certifications/`, and structured data all read from it. If it lapses, set `verified: false` on 2027-06-16. The trust strip names this cert on every page, so an expired one there is a misrepresentation. |
| EPA RRP Certified Renovator (individual) | Cody Mortensen | R-I-18955-25-00009, Industrial Hygiene Resources, Ltd. | **2030-04-24** | Set a reminder for **2030-02-24**. Update `currentThrough` on renewal. |

Both are individual certifications. They render with "Held by Cody Mortensen"
in the footer and on `/certifications/`, and in structured data they sit on a
`Person` node (`employee` of the business), never on the business itself.
Neither has a public verification lookup recorded yet (`verifyUrl: null`).

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
| `{{RADON_CERT}}` / `{{RADON_CERT_BODY}}` | `/radon-mitigation/` sells the service; `/certifications/` currently lists radon certification under "Pending confirmation". If Cody holds NRPP or NRSB, add the number and the body. If he does not, that section is already accurate and the radon page needs revisiting. |

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

**Round 1 (signature pages):**

| Slot | Page | Photo |
|---|---|---|
| `PHOTO_CONTAINMENT_HERO`, `_1`, `_2`, `_4`, `_5`, `_6`, `_7` | `/our-containment-process/` | IMG_6785, 8901, 0824, 3710, 8176, 0093, 1328 |
| `PHOTO_HERO`, `PHOTO_CONTAINMENT_1` | `/mold-found-during-home-inspection/` | IMG_3469, IMG_3711 |
| `PHOTO_CITY_BOISE` | `/mold-remediation-boise/` | `6-Mar 09…uLw6.jpg`, GPS Boise |
| `PHOTO_CITY_CALDWELL` | `/mold-remediation-caldwell/` | IMG_9633, GPS Caldwell |

**Round 2 (37 slots, no photo used twice):**

| Page | Slots filled | Photos |
|---|---|---|
| `/mold-remediation/` | hero, containment | IMG_5945, IMG_6656 |
| `/mold-inspection-testing/` | hero, containment | IMG_3844, IMG_6655 |
| `/asbestos-abatement/` | hero, containment, process, before/after | IMG_9441\*, IMG_5901\*, IMG_9438, IMG_6414 → IMG_6444 |
| `/asbestos-testing/` | hero, containment | IMG_3845, IMG_9424 |
| `/crawlspace-drainage/` | hero, containment | IMG_0949, IMG_8268 |
| `/crawlspace-encapsulation/` | containment | IMG_8174 |
| `/demolition/` | hero, process, containment | IMG_0088, IMG_9439, IMG_6787 |
| `/reconstruction/` | hero, containment, process | IMG_4809, IMG_6786, IMG_4779 |
| `/remodeling/` | containment, process | IMG_0089, IMG_9400 |
| `/water-damage-restoration/` | hero, containment, drying | IMG_2201, IMG_5942, IMG_2193 |
| Problem pages (dark band) | 7 | black-mold IMG_6660, insurance IMG_6653, musty IMG_3559, water-stain IMG_9427\*, before-remodel IMG_3842, popcorn IMG_6405, vermiculite IMG_5944 |
| `/commercial/` | hero, band | IMG_6255, IMG_6256 |
| `/for-builders/`, `/for-property-managers/`, `/for-realtors/` | band | IMG_9434\*, IMG_8820, IMG_5676 |
| `/mold-inspection-testing/` | process (`PHOTO_LAB_SAMPLE_1`) | MSG_2026-10-08_air-sample (Nampa, GPS-confirmed; third-party tester's air sample, sent by text 2026-10-22). Background softened, pump kept sharp. |

\* Blurred before export: room number (9441), desk paperwork (5901), whiteboard
writing (9427), chalkboard teacher name (9434). Asbestos waste bags were
checked at full size and carry no printed labels; captions say "bagged", never
"labeled". No lead signage appears in any photo, and no reconstruction
caption or alt text mentions fire.

### Still empty

| Slot | Page(s) | Why / what to shoot |
|---|---|---|
| `PHOTO_CONTAINMENT_3` | `/our-containment-process/` | Open machine showing two pre-filters ahead of the HEPA. |
| `PHOTO_LAB_SAMPLE_1` | `/for-builders/` hero, `/asbestos-testing-before-remodel/` hero, `/asbestos-testing/` process (`/mold-inspection-testing/` is filled) | Bagged, labelled samples beside a chain-of-custody form (redact the address). |
| `PHOTO_CLEARANCE_DOC_1` | `/mold-found-during-home-inspection/`, `/for-realtors/`, `/for-property-managers/` hero, `/does-homeowners-insurance-cover-mold/` hero | A documentation package on a table, names and addresses redacted. |
| `PHOTO_CRAWLSPACE_1` | `/black-mold-in-crawl-space/` hero, `/crawlspace-drainage/` process | Standing water under a house, barrier floated clear of the soil. |
| `PHOTO_ENCAPSULATION_1`, encapsulation `PHOTO_HERO` | `/crawlspace-encapsulation/` | Finished liner up the piers and stem wall, seams sealed. |
| `PHOTO_INTRO_1` | `/mold-remediation/`, `/water-damage-restoration/` | Portrait: moisture meter against framing or drywall. |
| `PHOTO_PROCESS_1` | `/mold-remediation/` | Bagged material inside a **mold** containment. The bagged shots on file are from abatement jobs. |
| `PHOTO_BEFORE_1`/`_AFTER_1`, `PHOTO_BEFORE_AFTER_1`/`_2`, `PHOTO_REMODEL_BEFORE_1`/`_AFTER_1` | mold remediation, reconstruction, remodeling | Matched pairs from those job types. Sections stay hidden until both halves exist. |
| `PHOTO_ASBESTOS_BEFORE_1` | `/popcorn-ceiling-asbestos/` hero | A textured ceiling before removal. |
| `PHOTO_REMODEL_1` | `/remodeling/` hero | A finished remodel. |
| `PHOTO_RADON_1`, `PHOTO_RADON_2` | `/radon-mitigation/` | **Waiting on Cody**: is IMG_7746 a radon suction pit or a sump? |
| `PHOTO_VERMICULITE_1` | `/vermiculite-insulation/` hero | **Waiting on Cody**: is `2-Apr 10…mrA3.jpg` (Twin Falls) vermiculite? |
| `PHOTO_CITY_MERIDIAN`, `_NAMPA`, `_EAGLE` | city pages (hidden) | No GPS-confirmed photo from those cities. The one Nampa photo (the air sample) is on `/mold-inspection-testing/`; the Nampa page caption is about crawlspace water, which it does not show. |

Photos rejected in round 2 for privacy: IMG_6257 (student work on the walls
and a worker on a ladder) and IMG_0094 (lead paint warning sign overlapping the
asbestos sign).

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
