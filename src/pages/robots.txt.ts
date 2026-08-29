/**
 * robots.txt, generated rather than static.
 *
 * A file in public/ cannot be environment-aware, and this has to be: while the
 * site lives on workers.dev it must not be crawled at all, and at cutover it
 * must open up and point at the sitemap. Generating it from the same
 * STAGING_NOINDEX flag that drives the robots meta tag means the two can never
 * disagree — which they would if one were a static file somebody had to
 * remember to swap.
 */
import type { APIRoute } from "astro";
import { STAGING_NOINDEX, DOMAIN } from "../data/site";

export const GET: APIRoute = () => {
  const body = STAGING_NOINDEX
    ? [
        "# Staging. This host must not be crawled.",
        "# Flipped automatically by STAGING_NOINDEX in src/data/site.ts.",
        "User-agent: *",
        "Disallow: /",
        "",
      ].join("\n")
    : [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: https://${DOMAIN}/sitemap-index.xml`,
        "",
      ].join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
