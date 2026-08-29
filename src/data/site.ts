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
 * Handled by src/worker/index.ts, scoped to /api/* via run_worker_first in
 * wrangler.jsonc. The handler is page-agnostic: every form on the site posts
 * here and stamps its own source path, so this constant is the only thing
 * that changes if the endpoint ever moves.
 *
 * Delivery needs the LEAD_WEBHOOK_URL secret set — see PLACEHOLDERS.md.
 */
export const LEAD_ENDPOINT = "/api/lead";

/**
 * ============================================================
 *  STAGING NOINDEX — SET TO false AT DNS CUTOVER
 * ============================================================
 *
 * While the site lives on workers.dev it must not be indexed. The canonical
 * on every page already points at https://envirotechidaho.com, so an indexed
 * staging copy would either duplicate the real domain or hand Google a
 * canonical to a page that does not exist yet.
 *
 * true  -> every page emits <meta name="robots" content="noindex">
 * false -> only pages that ask for it (e.g. /thank-you/) are noindexed
 *
 * This is the single switch. Flip it, rebuild, deploy. Tracked in
 * PLACEHOLDERS.md as a cutover step.
 */
export const STAGING_NOINDEX = true;

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
