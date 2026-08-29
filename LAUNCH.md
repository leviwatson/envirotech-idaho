# Launch checklist — Enviro-Tech Idaho

Cutover from `envirotech-idaho.north11agency.workers.dev` to `envirotechidaho.com`.
Work top to bottom. Do not take the Wix site down until step 6 verifies (§16).

---

## 1. Search visibility

- [ ] `STAGING_NOINDEX` → `false` in `src/data/site.ts`
- [ ] `npm run build && npx wrangler deploy`
- [ ] Confirm no `<meta name="robots" content="noindex">` on any page:
      `curl -s https://envirotechidaho.com/ | grep -c noindex` → `0`

**Leaving this `true` makes the launched site invisible to search.** Highest-consequence item on this list.

## 2. Lead pipeline

- [ ] Rotate the Make webhook URL — the current one appeared in a chat transcript
- [ ] `npx wrangler secret put LEAD_WEBHOOK_URL` (new URL)
- [ ] `npx wrangler secret put LEAD_WEBHOOK_TOKEN` — Worker sends it as `X-Lead-Token`; have Make reject requests without it
- [ ] Change the notification recipient in the **Make scenario** from `levi@north11agency.com` to Cody's address
      *(the recipient is not in this repo — the Worker only posts to the webhook)*
- [ ] Delete the `TEST` rows from Make
- [ ] `npx wrangler deploy`, submit the live form once, confirm the row lands
- [ ] Confirm the Make scenario has retry or queueing on failure — nothing identifying is logged, so a failed lead is not recoverable

## 3. Redirects

- [ ] Pull the full URL list from the Wix dashboard (sitemap + dashboard pages)
- [ ] Write `public/_redirects`, one per line: `/old-path /new-path 301`
- [ ] Known so far: `/`, `/certifications`, `/services`
- [ ] Anything without a close equivalent → `/` , not a 404
- [ ] Deploy, then `curl -sI` each old path and confirm `301` + correct `location`

## 4. Domain

- [ ] Add `envirotechidaho.com` as a custom domain on the Worker (Cloudflare dashboard → Workers → Domains & Routes)
- [ ] Add `www.envirotechidaho.com`, redirecting to apex
- [ ] Confirm DNS propagated before touching Wix

## 5. Canonicals

- [ ] `site` in `astro.config.mjs` is already `https://envirotechidaho.com` — no change expected
- [ ] Spot-check: `curl -s https://envirotechidaho.com/mold-remediation/ | grep canonical`
      → `https://envirotechidaho.com/mold-remediation/`, `https`, trailing slash, no `workers.dev`

## 6. Verify before decommissioning Wix

- [ ] Every new page returns `200` on the live domain
- [ ] Every old Wix URL `301`s to its equivalent
- [ ] Form submits end to end on the live domain
- [ ] Only then take the Wix site down

## 7. Search Console

- [ ] Add and verify `envirotechidaho.com` (DNS TXT via Cloudflare)
- [ ] Submit `https://envirotechidaho.com/sitemap-index.xml`
- [ ] Request indexing on `/` and `/mold-remediation/`
- [ ] Set up GA4 + Meta Pixel; confirm `GTM-N9GZF7W7` is still wanted before carrying it over (§16)

---

## Blockers to clear first

- [ ] `PLACEHOLDERS.md` — no unresolved item blocking a page that is going live
- [ ] `/lead-paint-removal/` still blocked; EPA RRP row in the footer is a format mask, **not** a real number — verify the firm is certified or delete the row (§2.6, §4)
- [ ] Google Business Profile claimed and verified — §18, takes 1–2 weeks, start well before this
- [ ] `npm run build` passes all three guards: placeholders, nav, images
