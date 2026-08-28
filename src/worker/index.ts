/**
 * Lead delivery Worker.
 *
 * The site is static assets on Cloudflare Workers. This script handles the one
 * dynamic route the site has — POST /api/lead — and Cloudflare serves
 * everything else straight from ./dist. `run_worker_first` in wrangler.jsonc
 * scopes this to /api/*; nothing else touches the Worker.
 *
 * At a ~$7,500 average job (CLAUDE.md §1) a dropped lead is expensive, so the
 * failure behaviour matters more than the happy path:
 *  - A submission that cannot be emailed returns a non-2xx, which makes the
 *    form surface its "call us" fallback. It never reports success it did not
 *    achieve, and it never swallows a lead silently.
 *  - Every failure is logged with enough context to reconstruct the lead from
 *    Workers logs if the email never lands.
 */

interface Env {
  /** Resend API key. Set with: npx wrangler secret put RESEND_API_KEY */
  RESEND_API_KEY?: string;
  /** Destination inbox. */
  LEAD_TO: string;
  /** Sender. Must be on a domain verified in Resend. */
  LEAD_FROM: string;
  LEAD_FROM_NAME: string;
  /** Static asset binding — used for the no-JS redirect target. */
  ASSETS: Fetcher;
}

/** Field length caps. Generous for humans, bounded against payload abuse. */
const LIMITS = {
  name: 120,
  phone: 40,
  email: 200,
  city: 60,
  service: 60,
  details: 4000,
  source: 200,
} as const;

const clean = (value: FormDataEntryValue | null, max: number): string =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

/**
 * The no-JS path posts natively and gets a redirect; the enhanced path sends
 * Accept: application/json and gets JSON back.
 */
const wantsJson = (request: Request) =>
  (request.headers.get("accept") ?? "").includes("application/json");

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/api/lead") return new Response("Not found", { status: 404 });
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "POST" } });
    }

    // Same-origin check. Not a security boundary — just keeps the endpoint
    // from being trivially used as a mail relay from another site.
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== url.host) {
      return json({ ok: false, error: "bad_origin" }, 403);
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return json({ ok: false, error: "bad_request" }, 400);
    }

    // Honeypot. Bots fill the hidden field; humans never see it. Return a
    // plausible success so the bot has nothing to learn from the response.
    if (clean(form.get("company"), 200) !== "") {
      return wantsJson(request)
        ? json({ ok: true }, 200)
        : Response.redirect(new URL("/thank-you/", url).href, 303);
    }

    const lead = {
      name: clean(form.get("name"), LIMITS.name),
      phone: clean(form.get("phone"), LIMITS.phone),
      email: clean(form.get("email"), LIMITS.email),
      city: clean(form.get("city"), LIMITS.city),
      service: clean(form.get("service"), LIMITS.service),
      details: clean(form.get("details"), LIMITS.details),
      source: clean(form.get("source"), LIMITS.source),
    };

    // Mirrors the `required` attributes on the form. Name and phone only —
    // the field list is deliberately short (§10) and anything more is optional.
    if (!lead.name || !lead.phone) {
      return json({ ok: false, error: "missing_required" }, 422);
    }

    if (!env.RESEND_API_KEY) {
      // Misconfiguration, not a user error. Log the whole lead so it is
      // recoverable, and fail loudly so the form shows the phone number.
      console.error("RESEND_API_KEY missing — lead not delivered", JSON.stringify(lead));
      return json({ ok: false, error: "not_configured" }, 500);
    }

    const received = new Date().toLocaleString("en-US", {
      timeZone: "America/Boise",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Subject is built to be triaged from a phone lock screen: who, where,
    // what. The crew is three people (§3) and reads these on site.
    const subjectParts = ["New lead", lead.city || "Idaho", lead.service || "General", lead.name];
    const subject = subjectParts.join(" — ");

    const body = [
      `Name:     ${lead.name}`,
      `Phone:    ${lead.phone}`,
      `Email:    ${lead.email || "—"}`,
      `City:     ${lead.city || "—"}`,
      `Service:  ${lead.service || "—"}`,
      "",
      "Details:",
      lead.details || "—",
      "",
      "—",
      `Submitted from: ${lead.source || "/"}`,
      `Received:       ${received} (Mountain)`,
    ].join("\n");

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: `${env.LEAD_FROM_NAME} <${env.LEAD_FROM}>`,
          to: [env.LEAD_TO],
          subject,
          text: body,
          // Replying to the notification reaches the customer directly when
          // they gave an email. Otherwise replies go nowhere useful, so the
          // header is omitted rather than pointed at the sending address.
          ...(lead.email ? { reply_to: lead.email } : {}),
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        console.error(
          `Resend rejected the lead (HTTP ${response.status}): ${detail}`,
          JSON.stringify(lead),
        );
        return json({ ok: false, error: "send_failed" }, 502);
      }
    } catch (error) {
      console.error("Lead send threw", error, JSON.stringify(lead));
      return json({ ok: false, error: "send_failed" }, 502);
    }

    return wantsJson(request)
      ? json({ ok: true }, 200)
      : Response.redirect(new URL("/thank-you/", url).href, 303);
  },
};
