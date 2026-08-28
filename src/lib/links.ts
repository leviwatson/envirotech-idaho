/**
 * Link resolution against nav.json.
 *
 * One rule, applied everywhere: never render a link to a page that does not
 * exist. Collection entries can therefore declare their full §12 internal
 * linking now, and each link appears the moment its target ships.
 */
import navData from "../data/nav.json";

type Entry = { label: string; href: string; built?: boolean };

/** Flatten every href declared anywhere in nav.json. */
const index = new Map<string, Entry>();
const walk = (node: unknown): void => {
  if (Array.isArray(node)) {
    node.forEach(walk);
  } else if (node && typeof node === "object") {
    const entry = node as Record<string, unknown>;
    if (typeof entry.href === "string" && typeof entry.label === "string") {
      index.set(entry.href, entry as unknown as Entry);
    }
    Object.values(entry).forEach((v) => {
      if (v && typeof v === "object") walk(v);
    });
  }
};
walk(navData.primary);
walk(navData.secondary);

export const isBuilt = (href: string): boolean => index.get(href)?.built === true;

export const labelFor = (href: string): string | undefined => index.get(href)?.label;

/** Built entries only, in the order given. Unknown or unbuilt hrefs drop out. */
export const resolveLinks = (hrefs: readonly string[]): Entry[] =>
  hrefs
    .map((href) => index.get(href))
    .filter((e): e is Entry => Boolean(e?.built));
