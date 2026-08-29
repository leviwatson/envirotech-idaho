/**
 * Builds the single @graph each page emits (§11).
 *
 * One <script> per page instead of the three or four separate blocks the site
 * used to carry, with the business entity defined once per graph and
 * referenced by @id from everything else.
 */
import { businessNode, BUSINESS_ID } from "../data/organization";
import { toPlainText } from "./prose";
import { DOMAIN } from "../data/site";

const ORIGIN = `https://${DOMAIN}`;

export type Faq = { question: string; answer: string };
export type Crumb = { name: string; href: string };

type GraphOptions = {
  /** Absolute URL of the page. */
  url: string;
  /** Breadcrumb trail EXCLUDING Home, which is prepended. Empty on the homepage. */
  crumbs?: Crumb[];
  /** Rendered FAQ, if the page shows one. Text is plain-texted to match. */
  faqs?: readonly Faq[];
  /** Service pages only. Name and description come from the entry. */
  service?: { name: string; serviceType: string; description: string; areaServed?: string };
};

export const buildGraph = ({ url, crumbs = [], faqs, service }: GraphOptions) => {
  const graph: Record<string, unknown>[] = [businessNode()];

  if (crumbs.length) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [{ name: "Home", href: "/" }, ...crumbs].map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: `${ORIGIN}${c.href}`,
      })),
    });
  }

  if (service) {
    graph.push({
      "@type": "Service",
      "@id": `${url}#service`,
      name: service.name,
      serviceType: service.serviceType,
      description: service.description,
      url,
      // Referenced, not repeated.
      provider: { "@id": BUSINESS_ID },
      areaServed: service.areaServed
        ? { "@type": "City", name: `${service.areaServed}, Idaho` }
        : undefined,
    });
  }

  if (faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: toPlainText(f.question),
        acceptedAnswer: { "@type": "Answer", text: toPlainText(f.answer) },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};
