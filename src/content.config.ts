/**
 * Content collections (§14).
 *
 * Service pages generate from this collection so structure cannot drift.
 * Every word that is unique to a service lives in the entry — the layout is
 * structure only and contains no copy.
 *
 * Prose fields are arrays of paragraphs. They accept inline markdown links,
 * [text](/href/), which src/lib/prose.ts resolves against nav.json: a link to
 * an unbuilt page renders as plain text instead, so in-body internal links
 * (§12) can be written now and light up as their targets ship.
 */
import { defineCollection, z, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";

/** The image() helper Astro passes into a schema function. */
type ImageFn = SchemaContext["image"];

/** A titled prose block: heading plus paragraphs. */
const section = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()).min(1),
});

/**
 * One photo position. `src` stays optional until real photography exists;
 * `name` is the PLACEHOLDERS.md slot token, carried as data-photo rather than
 * a {{TOKEN}} so the build guard stays green.
 */
const slot = (image: ImageFn) =>
  z.object({
    name: z.string(),
    ratio: z.string().default("4/3"),
    caption: z.string().optional(),
    alt: z.string().optional(),
    src: image().optional(),
    /** Rendered cap, e.g. "560px". Per placement, not per photo. */
    maxWidth: z.string().optional(),
    tone: z.enum(["light", "dark"]).default("light"),
  });

const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  // Function form so photo slots can resolve real image files through
  // image() once photography is supplied.
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      // §11: under 60 chars, unique. 140–158 for the description.
      title: z.string().max(60),
      h1: z.string(),
      metaDescription: z.string().min(140).max(158),
      priority: z.enum(["primary", "high", "medium", "low"]),

      /** One sentence under the H1. */
      subhead: z.string(),
      serviceType: z.string(),

      intro: section,
      problem: section,

      process: z.object({
        heading: z.string(),
        intro: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .min(1),
      }),

      /**
       * The containment callout renders by default, because containment-first
       * is the §6 positioning and it belongs on almost every service page.
       *
       * Set false only where containment is genuinely not part of the work.
       * The alternative is contorting a section's copy to justify its
       * presence, which is worse than omitting it. Dropping the band also
       * restores the seam divider before the scope section (§13).
       */
      showContainment: z.boolean().default(true),
      /** Overrides the sitewide containment copy when a service needs its own. */
      containment: section.partial().optional(),

      scope: z.object({
        heading: z.string(),
        intro: z.string().optional(),
        items: z.array(z.string()).min(1),
        excludesHeading: z.string().optional(),
        excludes: z.array(z.string()).optional(),
      }),

      timeline: z.object({
        heading: z.string(),
        paragraphs: z.array(z.string()).min(1),
        /** figure is set in mono (§13) — "3–4 days", "1–2 days". */
        stages: z.array(z.object({ figure: z.string(), label: z.string() })).min(1),
      }),

      inspectionTesting: section.partial().optional(),
      insurance: section.partial().optional(),
      serviceAreas: z
        .object({
          heading: z.string(),
          blurb: z.string(),
          /** One prose line per city. Inline links activate as city pages ship. */
          cities: z.array(z.string()).min(1),
        })
        .partial()
        .optional(),

      faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),

      /**
       * Photo slots. Every service page gets the same set, so adding
       * photography to a new service is data, not markup. A slot with no
       * `src` renders a skeleton at its ratio — the space is reserved from
       * the day the page ships, so nothing reflows when photos land.
       */
      photos: z
        .object({
          hero: slot(image).optional(),
          intro: slot(image).optional(),
          containment: slot(image).optional(),
          /** afterStep is 1-based and names the process step it follows. */
          process: slot(image).extend({ afterStep: z.number().int().min(1) }).optional(),
          beforeAfter: z
            .object({
              heading: z.string(),
              before: slot(image),
              after: slot(image),
            })
            .optional(),
        })
        .optional(),

      /** Hrefs only. Unbuilt targets are skipped, never rendered as dead links. */
      relatedProblems: z.array(z.string()).default([]),
      relatedCities: z.array(z.string()).default([]),
    }),
});

/**
 * Problem / intent pages (§9). Their section structure genuinely varies —
 * one page argues a timeline, another explains a material — so sections are
 * an ordered array rather than named fields. The layout still owns rendering
 * and holds no copy.
 */
/**
 * Shared shape for pages built from an ordered list of sections: problem /
 * intent pages and audience pages. Both argue a case in their own order
 * rather than filling fixed fields, and both render through SectionsPage.
 */
const sectionsPage = (image: ImageFn) =>
  z.object({
    slug: z.string(),
    title: z.string().max(60),
    h1: z.string(),
    metaDescription: z.string().min(140).max(158),
    /** The question the page answers. Problem pages always have one. */
    question: z.string().optional(),
    subhead: z.string(),

    sections: z
      .array(
        z.object({
          heading: z.string(),
          paragraphs: z.array(z.string()).min(1),
          /** Optional bullets after the paragraphs. */
          items: z.array(z.string()).optional(),
          /** Prose after the list, where the list needs closing out. */
          outro: z.array(z.string()).optional(),
          /** Optional figures, set in mono (§13). */
          stages: z.array(z.object({ figure: z.string(), label: z.string() })).optional(),
          /**
           * Renders on the full-bleed dark band instead of the light field.
           * At most one per page — it is the containment callout.
           */
          band: z.boolean().default(false),
          /**
           * Marks a thematic shift, so the layout puts a seam divider above
           * it. §13 fixes four positions on a service page; these pages vary,
           * so the shift is declared here and the layout still enforces that
           * no divider may sit against a full-bleed band.
           */
          shift: z.boolean().default(false),
          /** Optional CTA. Omitted until the asset it points at exists. */
          cta: z.object({ label: z.string(), href: z.string() }).optional(),
          photo: slot(image).optional(),
        }),
      )
      .min(1),

    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
    photos: z.object({ hero: slot(image).optional() }).optional(),
    relatedServices: z.array(z.string()).default([]),
    relatedCities: z.array(z.string()).default([]),
  });

/** Problem / intent pages (§9). */
const problems = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/problems" }),
  schema: ({ image }) => sectionsPage(image),
});

/** Audience pages (§9) — realtors, builders, property managers, commercial. */
const audiences = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/audiences" }),
  schema: ({ image }) => sectionsPage(image),
});

/**
 * Emergency pages (§9). Their own collection because their shape is not a
 * service page's: no process table, no scope list, no timeline. The reader has
 * water coming in and needs a phone number and three things to do, in that
 * order, before anything else on the page.
 */
const emergency = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/emergency" }),
  schema: () =>
    z.object({
      slug: z.string(),
      title: z.string().max(60),
      h1: z.string(),
      metaDescription: z.string().min(140).max(158),
      subhead: z.string(),

      /** The amber band at the very top, above the H1. */
      callBand: z.object({ label: z.string(), note: z.string() }),

      /** What to do before anyone arrives. Rendered large and high contrast. */
      actions: z.object({
        heading: z.string(),
        intro: z.string().optional(),
        items: z.array(z.object({ title: z.string(), detail: z.string() })).min(1),
        /** Stated once, plainly. Never a wall of warnings. */
        caution: z.string(),
      }),

      arrival: z.object({
        heading: z.string(),
        intro: z.string().optional(),
        steps: z.array(z.object({ title: z.string(), description: z.string() })).min(1),
      }),

      /** Everything below the fold: response, insurance, what follows. */
      sections: z
        .array(z.object({ heading: z.string(), paragraphs: z.array(z.string()).min(1) }))
        .min(1),

      faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
      relatedServices: z.array(z.string()).default([]),
      relatedCities: z.array(z.string()).default([]),
    }),
});

/**
 * Guides (§9 trust cluster). Visual walkthroughs: an ordered list of elements,
 * each one a photo plus what it is, why it is there, and what goes wrong
 * without it. /our-containment-process/ is the signature page (§10).
 */
const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      title: z.string().max(60),
      h1: z.string(),
      metaDescription: z.string().min(140).max(158),
      subhead: z.string(),
      hero: slot(image).optional(),

      /** The single idea the rest of the page demonstrates. */
      premise: z.object({
        heading: z.string(),
        paragraphs: z.array(z.string()).min(1),
      }),

      /**
       * The walkthrough. Deliberately no numbered markers: §13 reserves those
       * for the two 7-step process sequences. Order is carried by sequence
       * and by the copy, not by a counter.
       */
      build: z.object({
        heading: z.string(),
        intro: z.string().optional(),
        elements: z
          .array(
            z.object({
              name: z.string(),
              what: z.string(),
              why: z.string(),
              /** What goes wrong when this element is missing or done badly. */
              without: z.string(),
              photo: slot(image),
            }),
          )
          .min(1),
      }),

      /** The homeowner-usable checklist — the reason anyone links to this. */
      checklist: z.object({
        heading: z.string(),
        intro: z.string().optional(),
        items: z.array(z.object({ ask: z.string(), detail: z.string() })).min(1),
        outro: z.array(z.string()).optional(),
      }),

      /** Remaining prose sections, rendered in order. */
      sections: z
        .array(z.object({ heading: z.string(), paragraphs: z.array(z.string()).min(1) }))
        .min(1),

      faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
      relatedServices: z.array(z.string()).default([]),
    }),
});

export const collections = { services, problems, audiences, emergency, guides };
