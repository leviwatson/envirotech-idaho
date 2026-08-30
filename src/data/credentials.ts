/**
 * Credentials — the single source for license strings (§4).
 *
 * The footer, the structured data, and /certifications/ all read this, so a
 * number cannot be retyped differently in three places.
 *
 * `verified` is the gate for anything that asserts we HOLD a credential:
 * structured data, and the "held" section of /certifications/. A value that
 * renders as a visible pending mask may appear where a human can see it is
 * unfilled, but must never be asserted to a machine or written as though it
 * were in hand (§2.1). Misrepresenting licensure is a legal exposure for the
 * client, not an SEO problem.
 *
 * `lastVerified` is deliberately absent on every entry: nobody has recorded
 * when these were last checked against the issuing body, and inventing a date
 * would be worse than omitting one. The page renders the line only when the
 * field is present. Tracked in PLACEHOLDERS.md.
 */
export type Credential = {
  label: string;
  value: string;
  /** Who issues it. Null where it needs no issuer; a {{TOKEN}} where unknown. */
  issuer: string | null;
  /** Firm-level registration versus an individual's certification (§4). */
  level: "firm" | "individual";
  /** Plain-language explanation of what the credential is. */
  whatItIs: string;
  /** What holding it actually permits. */
  permits: string;
  /** Authoritative .gov lookup. Null where no public lookup is confirmed. */
  verifyUrl: string | null;
  /** ISO date this was last checked against the issuer. Unset = not recorded. */
  lastVerified?: string;
  /** Safe to assert as held. False for masks and unconfirmed values. */
  verified: boolean;
};

export const CREDENTIALS: Credential[] = [
  {
    label: "Idaho Contractor Registration",
    value: "RCE-8871958",
    issuer: "Idaho Division of Occupational and Professional Licenses",
    level: "firm",
    whatItIs:
      "Idaho requires most construction contractors to register with the state before offering or performing work. It is a registration rather than a trade exam, and it confirms the business exists, carries the insurance the state requires, and has not been barred from working.",
    permits:
      "Operating as a construction contractor in Idaho. Working unregistered is a violation, and an unregistered contractor can have difficulty enforcing a contract.",
    verifyUrl: "https://dopl.idaho.gov/license-search/",
    verified: true,
  },
  {
    label: "Asbestos / Mold Certification",
    value: "CMR0000023347",
    issuer: "{{CMR_ISSUING_ORG}}",
    level: "individual",
    whatItIs:
      "Certification held for asbestos and mold work. We are confirming which body issued it before publishing a verification route, because pointing you at the wrong registry is worse than pointing you at none.",
    permits:
      "Performing the abatement and remediation work described across this site.",
    verifyUrl: null,
    verified: true,
  },
  {
    label: "EPA RRP Firm Certification",
    value: "NAT-F______-_",
    issuer: "U.S. Environmental Protection Agency",
    level: "firm",
    whatItIs:
      "Firm-level certification under the federal Renovation, Repair and Painting rule, required to disturb paint in housing or child-occupied facilities built before 1978. EPA administers the program directly in Idaho.",
    permits:
      "Renovation work that disturbs lead-based paint in pre-1978 buildings. The firm number is not published yet, so it renders sitewide as a visible pending mask rather than as a confirmed credential — including on /lead-paint-removal/, which describes the service.",
    verifyUrl: "https://cdxocsppapps.epa.gov/ocspp-oppt-lead/firm-location-search",
    verified: false,
  },
  {
    label: "Radon Mitigation Certification",
    value: "{{RADON_CERT}}",
    issuer: "{{RADON_CERT_BODY}}",
    level: "individual",
    whatItIs:
      "National certification for radon mitigation, issued by either NRPP or NRSB. Which of the two applies here is unconfirmed.",
    permits: "Designing and installing radon mitigation systems.",
    verifyUrl: null,
    verified: false,
  },
  { label: "IICRC", value: "{{IICRC_CERT}}", issuer: null, level: "individual",
    whatItIs: "", permits: "", verifyUrl: null, verified: false },
  { label: "Liability Coverage", value: "{{LIABILITY_COVERAGE_AMOUNT}}", issuer: null, level: "firm",
    whatItIs: "", permits: "", verifyUrl: null, verified: false },
  { label: "Workers' Comp", value: "{{WORKERS_COMP_STATUS}}", issuer: null, level: "firm",
    whatItIs: "", permits: "", verifyUrl: null, verified: false },
];

/** Unfilled {{TOKENS}} must never render (§5 build guard). */
export const isPlaceholder = (v: string | null): boolean =>
  !v || /^\{\{.*\}\}$/.test(v);

/** What the footer shows: anything with a real or visibly-pending value. */
export const visibleCredentials = CREDENTIALS.filter((c) => !isPlaceholder(c.value));

/** What schema may assert, and what /certifications/ lists as held. */
export const schemaCredentials = CREDENTIALS.filter(
  (c) => c.verified && !isPlaceholder(c.value),
);

/** Explained on /certifications/ as held. */
export const heldCredentials = schemaCredentials;

/**
 * Explained on /certifications/ as NOT yet held or not yet confirmed. Only
 * those with real explanatory copy — the bare {{TOKEN}} rows stay in the
 * footer's suppression list rather than being written up as pending.
 */
export const pendingCredentials = CREDENTIALS.filter(
  (c) => !c.verified && c.whatItIs !== "",
);
