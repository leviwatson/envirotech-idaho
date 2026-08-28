/**
 * Image weight guard.
 *
 * Caps any single optimized image at 200KB. Astro emits derivatives to
 * dist/_astro/; anything in public/ ships byte-for-byte and is checked too,
 * because an unoptimized file dropped in there bypasses Astro entirely and is
 * the most likely way this cap gets broken.
 *
 * LCP under 2.0s on 4G mobile (§14) does not survive a 1MB hero photo, and
 * the failure is silent — the page still works, it is just slow. So it fails
 * the build instead.
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const CAP = 200 * 1024;
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

const walk = async (dir, out = []) => {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else if (EXT.has(path.extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
};

const files = await walk("dist");
const sized = await Promise.all(
  files.map(async (f) => ({ file: f, bytes: (await stat(f)).size })),
);

const over = sized.filter((f) => f.bytes > CAP).sort((a, b) => b.bytes - a.bytes);
const kb = (b) => `${Math.round(b / 1024)}KB`;

if (over.length) {
  console.error(`Image check failed — ${over.length} file(s) over ${kb(CAP)}:`);
  for (const f of over) console.error(`  - ${f.file}  ${kb(f.bytes)}`);
  console.error("  Re-export smaller, or route it through Astro's <Image>/<Picture>.");
  process.exit(1);
}

const total = sized.reduce((n, f) => n + f.bytes, 0);
const largest = sized.sort((a, b) => b.bytes - a.bytes)[0];
console.log(
  `Image check passed — ${sized.length} image(s), ${kb(total)} total` +
    (largest ? `, largest ${path.basename(largest.file)} at ${kb(largest.bytes)}` : ""),
);
