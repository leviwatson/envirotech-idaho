/**
 * Lead delivery Worker.
 *
 * The site is static assets on Cloudflare Workers. This handles the one
 * dynamic route the site has — POST /api/lead — and Cloudflare serves
 * everything else straight from ./dist. `run_worker_first` in wrangler.jsonc
 * scopes this to /api/*, so nothing else invokes the Worker.
 *
 * The handler is page-agnostic: every LeadForm on the site posts the same
 * payload here and stamps its own path, so adding the form to a new page
 * needs no change in this file.
 *
 * PRIVACY: nothing identifying is ever logged. No name, phone, email, address
 * or free text reaches console output, and the client IP is hashed before it
 * is used as a rate-limit key. Diagnostics carry a request id, a status, and
 * the source path — enough to debug a failure, nothing that describes a
 * person. The consequence is deliberate and worth knowing: a submission that
 * cannot be delivered is NOT recoverable from logs. That is what the retry
 * and the phone-number fallback are for.
 */

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  /**
   * Where leads are forwarded. Set with:
   *   npx wrangler secret put LEAD_WEBHOOK_URL
   * Never committed — it is a secret, not a var, because most webhook URLs
   * are themselves the credential.
   */
  LEAD_WEBHOOK_URL?: string;
  /** Optional shared secret, sent as X-Lead-Token if the receiver wants one. */
  LEAD_WEBHOOK_TOKEN?: string;
  /** Cloudflare rate limiting binding. Absent bindings degrade gracefully. */
  LEAD_LIMITER?: RateLimiter;
  ASSETS: Fetcher;
}

/** Field caps. Generous for humans, bounded against payload abuse. */
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

/** Enhanced form sends Accept: application/json; a native POST does not. */
const wantsJson = (request: Request) =>
  (request.headers.get("accept") ?? "").includes("application/json");

/** Short, non-reversible identifier for a client, for rate limiting only. */
const hashed = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/api/lead") return new Response("Not found", { status: 404 });
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "POST" } });
    }

    // Same-origin check. Not a security boundary — it just stops the endpoint
    // being used as an open relay from another site.
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== url.host) {
      return json({ ok: false, error: "bad_origin" }, 403);
    }

    // Correlates a client-side failure with a log line, and carries nothing
    // about who submitted.
    const requestId = crypto.randomUUID().slice(0, 8);

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return json({ ok: false, error: "bad_request", requestId }, 400);
    }

    const redirect = () => Response.redirect(new URL("/thank-you/", url).href, 303);

    /**
     * Bot detection: two independent signals, and BOTH must fire to drop a
     * submission.
     *
     * A single signal used to be enough, and it cost real leads — browser
     * autofill was filling the honeypot from a saved address profile, so
     * genuine people were silently discarded. At a ~$7,500 average job a false
     * positive is far more expensive than a false negative, so the threshold
     * is two. One signal is logged and delivered anyway.
     *
     * Signal 1 — honeypot. A field no person can see or tab to. It is named
     * verify_ref rather than anything resembling a real field, because that
     * is what made autofill ignore it.
     *
     * Signal 2 — timing. A form completed in under two seconds was not typed.
     * Absent without JS (native POST), and absence is not a signal.
     */
    const signals: string[] = [];

    if (clean(form.get("verify_ref"), 200) !== "") signals.push("honeypot");

    const elapsedRaw = clean(form.get("elapsed_ms"), 20);
    const elapsed = elapsedRaw === "" ? null : Number(elapsedRaw);
    if (elapsed !== null && Number.isFinite(elapsed) && elapsed < 2000) {
      signals.push("too_fast");
    }

    const sourceForLog = clean(form.get("source"), LIMITS.source) || "/";

    if (signals.length >= 2) {
      // Answer with a plausible success so the bot learns nothing, and drop
      // it. Logged so the decision is visible in `wrangler tail`.
      console.warn(
        `[${requestId}] dropped as bot: ${signals.join(" + ")}, from ${sourceForLog}`,
      );
      return wantsJson(request) ? json({ ok: true }, 200) : redirect();
    }

    if (signals.length === 1) {
      // Suspicious but delivered. If this line starts appearing alongside
      // real leads, that signal is misfiring and should be re-tuned.
      console.warn(
        `[${requestId}] suspicious but delivered: ${signals[0]}, from ${sourceForLog}`,
      );
    }

    // Rate limit on a hash of the client IP. The raw address is never stored,
    // logged, or forwarded.
    const ip = request.headers.get("cf-connecting-ip");
    if (env.LEAD_LIMITER && ip) {
      const { success } = await env.LEAD_LIMITER.limit({ key: await hashed(ip) });
      if (!success) {
        return json({ ok: false, error: "rate_limited", requestId }, 429);
      }
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

    // Mirrors the `required` attributes on the form. Name and phone only.
    if (!lead.name || !lead.phone) {
      return json({ ok: false, error: "missing_required", requestId }, 422);
    }

    if (!env.LEAD_WEBHOOK_URL) {
      console.error(`[${requestId}] LEAD_WEBHOOK_URL is not set — lead not delivered`);
      return json({ ok: false, error: "not_configured", requestId }, 500);
    }

    const sourcePath = lead.source || "/";
    const payload = {
      ...lead,
      // Which page produced the lead, as a path and as a full URL.
      sourcePath,
      sourceUrl: new URL(sourcePath, url.origin).href,
      receivedAt: new Date().toISOString(),
      receivedAtLocal: new Date().toLocaleString("en-US", {
        timeZone: "America/Boise",
        dateStyle: "medium",
        timeStyle: "short",
      }),
      requestId,
    };

    const post = () =>
      fetch(env.LEAD_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(env.LEAD_WEBHOOK_TOKEN ? { "x-lead-token": env.LEAD_WEBHOOK_TOKEN } : {}),
        },
        body: JSON.stringify(payload),
      });

    // One retry. Nothing identifying is logged, so a lost lead cannot be
    // reconstructed afterwards — a cheap second attempt is worth more here
    // than it would be on a route where the payload is recoverable.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await post();
        if (response.ok) {
          return wantsJson(request) ? json({ ok: true, requestId }, 200) : redirect();
        }
        console.error(
          `[${requestId}] webhook rejected: HTTP ${response.status}, attempt ${attempt}, from ${sourcePath}`,
        );
      } catch {
        console.error(`[${requestId}] webhook threw, attempt ${attempt}, from ${sourcePath}`);
      }
      if (attempt === 1) await new Promise((r) => setTimeout(r, 400));
    }

    return json({ ok: false, error: "send_failed", requestId }, 502);
  },
};
