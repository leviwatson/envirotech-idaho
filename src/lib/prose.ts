/**
 * Inline prose rendering for collection copy.
 *
 * Supports exactly two things, deliberately: [text](/href/) links and
 * [[keyword]] shorthand. Copy in a collection entry is not a place for
 * arbitrary HTML.
 *
 * Both resolve through src/data/link-map.json, which is the §12 authority on
 * WHERE a concept links. Anchor wording stays contextual in the copy — §12
 * asks for descriptive anchor text placed where it helps the reader, and
 * flattening every link to one canonical phrase would make the site read like
 * a directory. The map governs the destination; the sentence governs the words.
 *
 * A link whose target is not built yet renders as its plain text, so a page
 * can declare its internal links before the targets exist without ever
 * shipping a dead link.
 */
import linkMap from "../data/link-map.json";

const destinations = linkMap.destinations as Record<string, { label: string; built: boolean }>;
const keywords = linkMap.keywords as Record<string, string>;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const LINK = /\[([^\]]+)\]\((\/[^)]*\/)\)/g;
const SHORTHAND = /\[\[([^\]]+)\]\]/g;

/** Is this destination live? Unknown hrefs are never linked. */
export const isLinkable = (href: string): boolean => destinations[href]?.built === true;

/** Every href referenced by prose, for the build-time validation pass. */
export const knownDestination = (href: string): boolean => href in destinations;

export const renderProse = (text: string): string => {
  let out = escapeHtml(text);

  // [[keyword]] — destination and default anchor both come from the map.
  out = out.replace(SHORTHAND, (_m, key: string) => {
    const href = keywords[key.trim().toLowerCase()];
    if (!href) return key;
    const dest = destinations[href];
    if (!dest?.built) return dest?.label ?? key;
    return `<a href="${href}">${dest.label}</a>`;
  });

  // [text](/href/) — explicit anchor wording, destination still validated.
  out = out.replace(LINK, (_m, label: string, href: string) =>
    isLinkable(href) ? `<a href="${href}">${label}</a>` : label,
  );

  return out;
};

/**
 * The same string as it renders on the page, with markup removed.
 *
 * Structured data must mirror the visible text exactly (Google's own
 * requirement), so this exists to keep schema and copy from diverging: the
 * schema was previously fed the raw source, which shipped literal
 * "[label](/href/)" into 14 FAQ answers.
 */
export const toPlainText = (text: string): string =>
  text
    .replace(SHORTHAND, (_m, key: string) => {
      const href = keywords[key.trim().toLowerCase()];
      return href ? (destinations[href]?.label ?? key) : key;
    })
    .replace(LINK, (_m, label: string) => label);

/** How many links in this text actually resolved — used by the §12 audit. */
export const countLiveLinks = (text: string): number =>
  [...text.matchAll(LINK)].filter(([, , href]) => isLinkable(href)).length;
