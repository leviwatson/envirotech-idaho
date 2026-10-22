/**
 * The business entity, defined once (§11).
 *
 * Every page's @graph carries this node exactly once and other nodes point at
 * it by @id, rather than each Service inlining its own copy of the provider —
 * which is what the site did before, 17 times over.
 *
 * The node is present in each page's graph rather than only on the homepage.
 * A bare @id reference to a node defined on some other page resolves to
 * nothing when a crawler processes a page in isolation, so "define once,
 * reference many" applies within a page, not across the site.
 *
 * Omitted on purpose, and none of it is invented:
 *  - address      — service-area business, no public address exists (§3)
 *  - geo          — would require a coordinate for an address we do not have
 *  - priceRange   — no prices are published anywhere (§10), so any value
 *                   would be a guess presented as fact
 *  - aggregateRating / review — zero reviews exist (§2.2), and rating markup
 *                   without visible reviews is a manual-action risk
 */
import { BUSINESS_NAME, PHONE_DISPLAY, EMAIL, DOMAIN, FOUNDED, CITIES } from "./site";
import { schemaCredentials, personCredentials, isPlaceholder, type Credential } from "./credentials";

const ORIGIN = `https://${DOMAIN}`;

/** Stable, apex-based. Other nodes reference this string. */
export const BUSINESS_ID = `${ORIGIN}/#business`;

/**
 * Profiles the business is verifiably present on. The Google Business Profile
 * does not exist yet (§18) — add its URL here and every page picks it up.
 * Empty means the property is omitted rather than emitted empty.
 */
export const SAME_AS: string[] = [];

const credentialNode = (c: Credential) => ({
  "@type": "EducationalOccupationalCredential",
  name: c.label,
  identifier: c.value,
  credentialCategory: "certification",
  ...(!isPlaceholder(c.issuer) ? { recognizedBy: { "@type": "Organization", name: c.issuer } } : {}),
  ...(c.currentThrough ? { expires: c.currentThrough } : {}),
});

/**
 * Individual certifications sit on the person who holds them. Asserting them
 * on the business would tell a parser the company holds them, which for an
 * individual EPA RRP renovator certification would read as firm certification.
 */
const people = () =>
  [...personCredentials()].map(([name, creds]) => ({
    "@type": "Person",
    name,
    hasCredential: creds.map(credentialNode),
  }));

export const businessNode = () => ({
  "@type": "HomeAndConstructionBusiness",
  "@id": BUSINESS_ID,
  name: BUSINESS_NAME,
  url: `${ORIGIN}/`,
  telephone: PHONE_DISPLAY,
  email: EMAIL,
  foundingDate: String(FOUNDED),
  areaServed: CITIES.map((city) => ({ "@type": "City", name: `${city}, Idaho` })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  hasCredential: schemaCredentials.map(credentialNode),
  ...(people().length ? { employee: people() } : {}),
  ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
});
