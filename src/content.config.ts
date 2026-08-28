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
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** A titled prose block: heading plus paragraphs. */
const section = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()).min(1),
});

const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: z.object({
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

    /** Hrefs only. Unbuilt targets are skipped, never rendered as dead links. */
    relatedProblems: z.array(z.string()).default([]),
    relatedCities: z.array(z.string()).default([]),
  }),
});

export const collections = { services };
