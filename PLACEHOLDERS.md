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
| `{{EPA_RRP_FIRM_NUMBER}}` | The entire `/lead-paint-removal/` page, plus lead paint testing and encapsulation. Not built, not linked, not referenced until this lands. | EPA RRP **firm** certification number (not an individual renovator card) and its expiration date |

## Credentials

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

| Token | Used on | Needed from client |
|---|---|---|
| `{{PHOTO_CONTAINMENT_1}}` … `{{PHOTO_CONTAINMENT_4}}` | `/our-containment-process/` (the signature page, §10) | Real job-site photos: poly sheeting with taped seams, the negative air machine and its ducting to an exterior opening, a manometer / pressure reading, a decon chamber |
| `{{PHOTO_BEFORE_AFTER_1}}` … `{{PHOTO_BEFORE_AFTER_6}}` | Service pages, city pages | Matched before/after pairs, same angle, ideally with the city noted so alt text can be truthfully local |

Also needed: a real photo of **Cody Mortensen** for `/about/` (§7 — the
owner-operator is the wedge against franchise competitors).

## Scope

| Token | Blocks | Needed from client |
|---|---|---|
| `{{DOES_NOT_DO}}` | Sewage and biohazard cleanup. Not advertised anywhere until resolved. | Confirm whether the company takes sewage / biohazard work, and if not, what it refers out |

---

## Not a placeholder, but still open

- **Lead form endpoint.** `LEAD_ENDPOINT` in `src/data/site.ts` points at
  `/api/lead`, which has no handler yet — `wrangler.jsonc` is assets-only.
  Needs either a Worker script or a hosted form endpoint before launch, plus
  a delivery destination (which inbox the leads land in).
- **GTM container `GTM-N9GZF7W7`** exists on the current Wix site. Confirm
  whether it is still in use before carrying it over (§16).
- **Full Wix URL list.** Required before decommissioning, for 301 mapping in
  `_redirects` (§16). Known so far: `/`, `/certifications`, `/services`.
