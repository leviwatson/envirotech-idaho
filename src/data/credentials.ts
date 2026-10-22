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
  /** Named holder of an individual certification. Unset = not recorded. */
  holder?: string;
  /** ISO date the credential is current through, from the certificate itself. */
  currentThrough?: string;
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
    label: "AHERA Asbestos Abatement Contractor/Supervisor",
    value: "7593-02",
    issuer: "Industrial Hygiene Resources, Ltd., Boise, ID",
    level: "individual",
    holder: "Cody Mortensen",
    currentThrough: "2027-06-16",
    whatItIs:
      "Accreditation as an asbestos abatement contractor/supervisor under the EPA Model Accreditation Plan established by AHERA, the federal Asbestos Hazard Emergency Response Act. It is earned through an accredited training course and kept current with annual refresher training, which is how this one is maintained.",
    permits:
      "Supervising asbestos abatement work, including directing the crew and the work practices inside the containment. It is an individual accreditation held by Cody Mortensen.",
    verifyUrl: null,
    verified: true,
  },
  {
    label: "EPA RRP Certified Renovator",
    value: "R-I-18955-25-00009",
    issuer: "Industrial Hygiene Resources, Ltd.",
    level: "individual",
    holder: "Cody Mortensen",
    currentThrough: "2030-04-24",
    whatItIs:
      "Individual certification under the EPA Renovation, Repair and Painting rule (40 CFR 745.225), earned through an EPA-accredited renovator course. A certified renovator is trained in lead-safe work practices and is responsible for applying them on a job.",
    permits:
      "Directing and performing lead-safe work practices on renovation work that disturbs paint in pre-1978 housing. It certifies the person, not the company: the RRP rule separately requires the firm itself to hold EPA firm certification, and ours is pending confirmation.",
    verifyUrl: null,
    verified: true,
  },
  {
    label: "EPA RRP Firm Certification",
    value: "NAT-F______-_",
    issuer: "U.S. Environmental Protection Agency",
    level: "firm",
    whatItIs:
      "Firm-level certification under the federal Renovation, Repair and Painting rule, required for a company to take on renovation work that disturbs paint in housing or child-occupied facilities built before 1978. It is separate from the individual Certified Renovator certification listed above. EPA administers the program directly in Idaho.",
    permits:
      "A company performing RRP renovation work as the contractor. Our firm certification is pending confirmation, so the number renders as a visible pending mask and we do not claim it.",
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

/** "2027-06-16" → "June 2027". Month and year only: the certificate's day is in the data. */
export const monthYear = (iso: string): string =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Look a credential up by label. Throws so a renamed label fails the build. */
export const credential = (label: string): Credential => {
  const c = CREDENTIALS.find((x) => x.label === label);
  if (!c) throw new Error(`credentials.ts: no credential labelled "${label}"`);
  return c;
};

/** What the footer shows: anything with a real or visibly-pending value. */
export const visibleCredentials = CREDENTIALS.filter((c) => !isPlaceholder(c.value));

/** What /certifications/ lists as held, and the pool structured data draws on. */
export const heldCredentials = CREDENTIALS.filter(
  (c) => c.verified && !isPlaceholder(c.value),
);

/**
 * Asserted on the business node. An individual certification with a named
 * holder is the person's, not the company's, so it is asserted on that person
 * instead (personCredentials) and never reads as a firm credential.
 */
export const schemaCredentials = heldCredentials.filter(
  (c) => !(c.level === "individual" && c.holder),
);

/** Individual certifications grouped by their named holder. */
export const personCredentials = (): Map<string, Credential[]> => {
  const byHolder = new Map<string, Credential[]>();
  for (const c of heldCredentials) {
    if (c.level !== "individual" || !c.holder) continue;
    byHolder.set(c.holder, [...(byHolder.get(c.holder) ?? []), c]);
  }
  return byHolder;
};

/**
 * Explained on /certifications/ as NOT yet held or not yet confirmed. Only
 * those with real explanatory copy — the bare {{TOKEN}} rows stay in the
 * footer's suppression list rather than being written up as pending.
 */
export const pendingCredentials = CREDENTIALS.filter(
  (c) => !c.verified && c.whatItIs !== "",
);
