/**
 * Credentials — the single source for license strings (§4).
 *
 * Both the footer and the structured data read this, so a number cannot be
 * retyped differently in two places. Values were moved here from
 * src/components/Footer.astro, which was the canonical copy.
 *
 * `verified` is the gate for structured data. A value that renders as a
 * visible pending mask may appear in the footer, where a human can see it is
 * unfilled, but must never be asserted to a machine as a real credential
 * (§2.1). The EPA RRP row is exactly that case.
 */
export type Credential = {
  label: string;
  value: string;
  issuer: string | null;
  /** Safe to emit as hasCredential. False for masks and unconfirmed values. */
  verified: boolean;
};

export const CREDENTIALS: Credential[] = [
  {
    label: "Idaho Contractor Registration",
    value: "RCE-8871958",
    issuer: null,
    verified: true,
  },
  {
    label: "Asbestos / Mold Certification",
    value: "CMR0000023347",
    issuer: "{{CMR_ISSUING_ORG}}",
    verified: true,
  },
  {
    // Visible format mask, NOT a number. Renders in the footer so the row lays
    // out at true width and reads as pending; excluded from schema because a
    // mask asserted to a machine is a claim we cannot support.
    label: "EPA RRP Firm Certification",
    value: "NAT-F______-_",
    issuer: null,
    verified: false,
  },
  { label: "IICRC", value: "{{IICRC_CERT}}", issuer: null, verified: false },
  {
    label: "Liability Coverage",
    value: "{{LIABILITY_COVERAGE_AMOUNT}}",
    issuer: null,
    verified: false,
  },
  {
    label: "Workers' Comp",
    value: "{{WORKERS_COMP_STATUS}}",
    issuer: null,
    verified: false,
  },
];

/** Unfilled {{TOKENS}} must never render (§5 build guard). */
export const isPlaceholder = (v: string | null): boolean =>
  !v || /^\{\{.*\}\}$/.test(v);

/** What the footer shows: anything with a real or visibly-pending value. */
export const visibleCredentials = CREDENTIALS.filter((c) => !isPlaceholder(c.value));

/** What schema may assert: confirmed values only. */
export const schemaCredentials = CREDENTIALS.filter(
  (c) => c.verified && !isPlaceholder(c.value),
);
