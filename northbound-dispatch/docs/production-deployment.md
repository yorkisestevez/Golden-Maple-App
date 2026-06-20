# Production Deployment — Going Live

> How to take the Northbound Dispatch site from this repo to a live production URL on
> `northbounddispatch.ca`. The site is **pure static** (no build step), so this is fast.
> Companion to [`road-to-customer-1.md`](./road-to-customer-1.md) Phase 0.

What's already production-ready in the repo:
- `website/` — static landing site, mobile-first, with `netlify.toml` (publish `.`, no build).
- Security headers + asset caching configured in `netlify.toml`.
- `robots.txt` + `sitemap.xml` present.
- Application form wired to FormSubmit (email delivery, no backend needed).

You will need to do the account/DNS/email steps yourself (they require logins I don't have).
Each step below says **who does what**.

---

## 1. Deploy the site to Netlify

**Recommended: connect the GitHub repo (auto-deploys on every push).**

1. Log in to **Netlify** → **Add new site → Import an existing project → GitHub**.
2. Pick the `golden-maple-app` repo.
3. **Base directory:** `northbound-dispatch/website`
   **Publish directory:** `northbound-dispatch/website` (the `netlify.toml` sets publish `.` relative to base)
   **Build command:** *(leave empty — static site)*
4. Deploy. You'll get a `*.netlify.app` URL immediately. Verify it loads.

> The repo also hosts `estimate-ai`, which already deploys on this Netlify account. Keep the two
> as **separate Netlify sites** with different base directories so their builds don't collide.

**Alternative: drag-and-drop / CLI (manual, no auto-deploy).**
```bash
cd northbound-dispatch/website
npx netlify-cli deploy --prod --dir .
```
Drag-and-drop the `website/` folder onto the Netlify dashboard works too, but loses auto-deploy
on push — prefer the GitHub connection above.

---

## 2. Point the custom domain

1. **Register `northbounddispatch.ca`** if not already owned (any registrar; ~$15/yr).
2. In Netlify: **Domain settings → Add custom domain →** `northbounddispatch.ca` (+ `www`).
3. Update DNS at the registrar per Netlify's instructions:
   - Easiest: set the registrar's **nameservers to Netlify DNS**, or
   - Keep your DNS and add the **A / CNAME records** Netlify shows.
4. Netlify auto-provisions a **Let's Encrypt HTTPS cert** once DNS resolves (can take up to ~24h).
5. Enable **"Force HTTPS"** and the **HTTP→HTTPS redirect** in Netlify.

**Done when:** `https://northbounddispatch.ca` loads with a valid certificate (green padlock).

---

## 3. Pre-launch content sweep

Before pointing customers at the site, confirm in `website/index.html`:

- [ ] **Phone number** is real (search the marketing templates too — `marketing/` has placeholders).
- [ ] **Email** shows `dispatch@northbounddispatch.ca`.
- [ ] **Pricing** reads 8% / $200-week, week-to-week, no setup fee.
- [ ] **"Dispatch service, not a broker"** language is present (legal positioning).
- [ ] `sitemap.xml` URL is the production domain.
- [ ] Favicon and brand assets render.

---

## 4. Business email

Customers will email `dispatch@northbounddispatch.ca`. Set up a real inbox:

- Use the domain registrar's email, **Google Workspace**, or an alias that forwards to a monitored inbox.
- Add **SPF / DKIM** records so your outbound mail (rate confs, invoices) doesn't land in spam.
- **Send a test** from the address and confirm replies arrive.

---

## 5. Activate the application form for production

The form in `website/index.html` currently posts to FormSubmit at
`yorkis@goldenmaplelandscaping.ca` — a **verified, working inbox** (chosen so submissions land
even before the dispatch inbox is set up).

To switch it to the dispatch inbox once that mailbox exists:

1. In `website/index.html`, change the form `action` to:
   `https://formsubmit.co/dispatch@northbounddispatch.ca`
2. **Submit the form once** — FormSubmit emails a one-time activation link to that address.
3. Click the activation link from the dispatch inbox. Submissions now route there.
4. Commit + push the change (Netlify auto-deploys).

> Later, Phase 4C replaces this with an **n8n webhook** (`action` → n8n URL) to trigger the
> automated onboarding flow with no other site changes. See `ai-automation-roadmap.md` §4C.

**Test it (whichever inbox is active):** submit a fake application and confirm the email arrives.

---

## 6. Post-launch verification checklist

- [ ] `https://northbounddispatch.ca` loads, HTTPS valid, `www` redirects to apex (or vice-versa)
- [ ] Site renders correctly on **mobile** (most owner-ops are on phones)
- [ ] Every nav link + CTA scrolls/works; phone + email links tap-to-call / tap-to-email
- [ ] Application form submits → email received
- [ ] `https://northbounddispatch.ca/sitemap.xml` and `/robots.txt` resolve
- [ ] Lighthouse pass (performance/SEO/accessibility) — optional but quick
- [ ] Auto-deploy confirmed: push a trivial change, see Netlify rebuild

---

## 7. Optional polish (after launch)

- **Analytics** — Netlify Analytics or a privacy-friendly tag to see traffic + form conversions.
- **Google Business Profile** — "Northbound Dispatch, Barrie ON" for local search.
- **Open Graph image** — so shared links preview nicely in Facebook groups / texts.
- **Submit sitemap** to Google Search Console.

---

## Who does what (summary)

| Step | I can do (in-repo) | You do (account/DNS/email) |
|---|---|---|
| 1. Deploy | Repo is deploy-ready; can adjust `netlify.toml` | Connect repo in Netlify, click deploy |
| 2. Domain | — | Register domain, set DNS, enable HTTPS |
| 3. Content sweep | Edit `index.html` (phone, email, copy) | Provide the real phone number |
| 4. Email | — | Create the inbox, add SPF/DKIM |
| 5. Form | Repoint the form `action`, commit/push | Click FormSubmit activation link |
| 6–7. Verify/polish | Add OG tags, run checks | Final live sign-off |

---

*Static, asset-light, and cheap to run. The only blockers to going live are a domain, an inbox,
and a Netlify connection — all doable in an afternoon.*
