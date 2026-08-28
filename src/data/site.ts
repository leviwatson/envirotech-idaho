/**
 * Canonical business facts (§3).
 *
 * Single source of truth. Phone, email, and city list are repeated across the
 * header, footer, call bar, lead form, and every schema block — §17 requires
 * they match exactly everywhere, so they are defined once here and imported.
 *
 * NO postal address. Enviro-Tech is a service-area business (§3): no address
 * renders anywhere on the site and no `PostalAddress` is ever emitted.
 */

export const PHONE_DISPLAY = "(208) 409-4505";
export const PHONE_HREF = "tel:2084094505";
export const EMAIL = "office@envirotechidaho.com";
export const BUSINESS_NAME = "Enviro-Tech Idaho";
export const FOUNDED = 2019;
export const DOMAIN = "envirotechidaho.com";

/** Primary service-area cities, in the §3 priority order. */
export const CITIES = ["Boise", "Meridian", "Nampa", "Caldwell", "Eagle"] as const;

/**
 * Where the lead form posts.
 *
 * NOT YET IMPLEMENTED — no handler exists at this path. wrangler.jsonc is
 * currently assets-only, so this route 404s until either a Worker script is
 * added (`main` + `run_worker_first` for /api/*) or this is pointed at a
 * hosted form endpoint. The form degrades to a native POST without JS, so
 * whichever way it is wired, this constant is the only thing that changes.
 */
export const LEAD_ENDPOINT = "/api/lead";

/**
 * Lead form service options. Values are the §9 service slugs so a submission
 * can be attributed to a service page without a separate mapping table.
 *
 * Lead paint is absent deliberately — §2.6 blocks it until the real EPA RRP
 * firm number lands. Sewage / biohazard is absent pending {{DOES_NOT_DO}}.
 */
export const LEAD_SERVICES = [
  { value: "mold-remediation", label: "Mold — removal / remediation" },
  { value: "mold-inspection-testing", label: "Mold — inspection or testing" },
  { value: "asbestos-abatement", label: "Asbestos — removal / abatement" },
  { value: "asbestos-testing", label: "Asbestos — testing" },
  { value: "water-damage-restoration", label: "Water damage" },
  { value: "crawlspace", label: "Crawlspace drainage or encapsulation" },
  { value: "reconstruction", label: "Reconstruction after remediation" },
  { value: "not-sure", label: "Not sure yet" },
] as const;
