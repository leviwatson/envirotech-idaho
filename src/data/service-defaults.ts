/**
 * Sitewide section copy shared by every service page.
 *
 * These paragraphs are fixed by CLAUDE.md §6 and must read identically on
 * every page — the insurance wording in particular is specified verbatim and
 * must not be paraphrased. Keeping them here rather than in the layout means
 * the template still holds no copy, and a service can override any of them
 * through its collection entry when it genuinely needs its own version.
 */

export const TRUST_STRIP = [
  { label: "Licensed & certified", detail: "Idaho registration RCE-8871958" },
  { label: "Available 24/7", detail: "Someone answers, any hour" },
  { label: "Third-party clearance", detail: "An independent lab signs off, not us" },
] as const;

/** §6 pillar 1. The single most concrete thing the business does. */
export const CONTAINMENT = {
  heading: "Containment goes up before anything else",
  paragraphs: [
    "A negative-pressure containment goes up before any work starts. Every job, mold or asbestos, regardless of size. Two pre-filters plus HEPA, ducted to an exterior opening, pulling a vacuum so nothing airborne leaves the work area.",
    "That last part is what matters to you. The pressure inside the containment is lower than the pressure in the rest of your house, so air moves in, never out. Spores and dust that get disturbed during removal go into the filter stack and out the duct instead of into your hallway, your vents, or the room your kids sleep in.",
    "Most of the fear people have about this work is not about the mold itself. It is about spreading it. Containment is the answer to that, and it is why we do not treat it as optional on small jobs.",
  ],
  /** Real job-site photo pending — tracked in PLACEHOLDERS.md. */
  photo: "PHOTO_CONTAINMENT_1",
  photoCaption:
    "Negative-pressure containment on a Treasure Valley job: poly sheeting, taped seams, and HEPA filtration ducted to an exterior opening.",
} as const;

/**
 * §6. The inspection and the testing are different things done by different
 * companies, and the copy must never blur them.
 *
 * Enviro-Tech does NOT perform laboratory testing. Diagnostic testing is
 * engaged and paid for by the customer, directly with an independent testing
 * company. Clearance testing at the end of an abatement is engaged by
 * Enviro-Tech but still performed and issued by that independent company.
 *
 * Never write anything implying we collect samples, quote testing, or mark it
 * up. "Free testing" remains forbidden — testing is not free, it is simply
 * not ours.
 */
export const INSPECTION_TESTING = {
  heading: "The inspection is free. The testing is not ours.",
  paragraphs: [
    "Someone comes out, looks at the problem, takes moisture readings, and writes you an estimate. That visit costs nothing and there is no obligation attached to it.",
    "Laboratory testing is a different job done by a different company. We do not perform it, we do not sell it, and we take no percentage of it. If you want material or air analyzed, you engage an independent testing company and pay them directly, and their result belongs to you regardless of who ends up doing the work.",
    "That separation is deliberate, and it is the whole argument. We are the company that gets paid to remove the problem. Us deciding whether you have one, and us certifying we fixed it, would be two conflicts of interest sitting either side of the same job. We have neither. Where work ends in clearance testing, we engage an independent company to carry it out and they issue the result directly.",
    "It has a practical consequence worth knowing. Because we do not sell testing, we have nothing to gain from telling you to buy it. When we say a lab result will not change what you should do next, that advice costs us nothing to give.",
  ],
} as const;

/** §6 — worded exactly as specified. Do not paraphrase. */
export const INSURANCE = {
  heading: "Insurance handled, you represented",
  paragraphs: [
    "We bill your insurance directly and work with your adjuster — and we document every step so your scope holds up. You're the client. The paperwork just goes to them.",
    "In practice that means photographing conditions before we touch anything, recording moisture readings as they change, and writing a scope specific enough that it does not come back denied for vagueness. Documentation is the difference between a claim that pays and a claim that argues.",
  ],
} as const;

/**
 * §6. The single approved way to answer "what does it cost".
 *
 * Framed as scope rather than policy: the reason there is no price list is
 * that jobs genuinely differ, not that we decline to say. Use this wording
 * verbatim wherever cost comes up — one phrasing, not five variations.
 * check-structure.mjs fails the build on a page that discusses pricing
 * without it.
 */
export const PRICING_LINE =
  "Every job has its own scope, its own complexity, and its own method, so one price list would be wrong more often than it was right. That is why the inspection is free and the estimate is written after someone has actually seen what you are dealing with.";

export const SERVICE_AREAS = {
  heading: "Where we work",
  blurb:
    "Treasure Valley focus, with statewide coverage across Idaho. Response times below are for the cities listed.",
} as const;
