/**
 * Inline prose rendering for collection copy.
 *
 * Supports exactly two things, deliberately: [text](/href/) links and nothing
 * else. Copy in a collection entry is not a place for arbitrary HTML.
 *
 * A link whose target is not built yet renders as its plain text, so a page
 * can declare its §12 internal links before the targets exist without ever
 * shipping a dead link.
 */
import { isBuilt } from "./links";

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const LINK = /\[([^\]]+)\]\((\/[^)]*\/)\)/g;

export const renderProse = (text: string): string =>
  escapeHtml(text).replace(LINK, (_match, label: string, href: string) =>
    isBuilt(href) ? `<a href="${href}">${label}</a>` : label,
  );

/** How many links in this text actually resolved — used by the §12 audit. */
export const countLiveLinks = (text: string): number =>
  [...text.matchAll(LINK)].filter(([, , href]) => isBuilt(href)).length;
