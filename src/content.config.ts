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

export const collections = { services };
