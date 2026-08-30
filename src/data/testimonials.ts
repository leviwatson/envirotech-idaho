/**
 * Testimonials (§2.2).
 *
 * THE BUSINESS HAS ZERO REVIEWS TODAY. Nothing in this file is real, and the
 * placeholder set exists to size and judge a layout, not to be read by a
 * customer. §2.2 forbids written testimonials, a populated reviews page, and
 * any `Review` or `aggregateRating` schema — fabricated review markup is a
 * manual-action risk, and a fabricated quote is worse than a manual action.
 *
 * How the band decides what to render, in order:
 *
 *   1. `TESTIMONIALS` has entries  -> render those. Real quotes, real people.
 *   2. Empty, and the site is on staging -> render PLACEHOLDER_TESTIMONIALS,
 *      so the layout can be judged on workers.dev.
 *   3. Empty, and the site is live -> render NOTHING. The band removes itself
 *      rather than shipping stubs.
 *
 * Step 3 is belt; the braces are in check-structure.mjs, which fails the build
 * outright if "[PLACEHOLDER]" reaches dist/ once STAGING_NOINDEX is false.
 *
 * When real reviews exist, fill TESTIMONIALS from the Google Business Profile
 * and delete the placeholder array. Tracked in PLACEHOLDERS.md as
 * {{TESTIMONIALS}} and {{GBP_REVIEW_COUNT}}.
 */
export type Testimonial = {
  /** The quote itself. Two lines is the design target. */
  quote: string;
  /** Attribution. Real first name and last initial, or however it appears. */
  name: string;
  /** City, for local signal. */
  city: string;
};

/** Real, publishable testimonials. Empty, and it stays empty until they exist. */
export const TESTIMONIALS: Testimonial[] = [];

/**
 * Layout scaffolding. Every quote is prefixed "[PLACEHOLDER]" and every name
 * is obviously not a person, so this cannot be mistaken for content at a
 * glance, in a screenshot, or in a diff. The build guard keys off that prefix.
 */
export const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "[PLACEHOLDER] Sample quote text sized to two lines so the tile height can be judged against its neighbours.",
    name: "Sample Name",
    city: "Boise, ID",
  },
  {
    quote:
      "[PLACEHOLDER] Second sample quote, deliberately a little shorter than the first one.",
    name: "Sample Name",
    city: "Meridian, ID",
  },
  {
    quote:
      "[PLACEHOLDER] Third sample quote, running to the full two lines to test the longer end of the range.",
    name: "Sample Name",
    city: "Nampa, ID",
  },
  {
    quote:
      "[PLACEHOLDER] Fourth sample quote for judging rhythm across a scrolling row.",
    name: "Sample Name",
    city: "Caldwell, ID",
  },
  {
    quote:
      "[PLACEHOLDER] Fifth sample quote, again around two lines at the tile width.",
    name: "Sample Name",
    city: "Eagle, ID",
  },
  {
    quote:
      "[PLACEHOLDER] Sixth sample quote, closing the loop before the marquee repeats.",
    name: "Sample Name",
    city: "Boise, ID",
  },
];
