# Northbound Dispatch

**AI-powered truck dispatch for Ontario owner-operators.**
*Your loads. Found. Confirmed. Done.*

Asset-light dispatch business operating from Barrie, Ontario. No vehicles owned — revenue from finding loads for independent owner-operators across Ontario and cross-border lanes (8% per load or $200/week flat). The AI stack is the moat: one operator manages 15–20 trucks where traditional dispatchers handle 5–7.

> **This is a dispatch service, not a freight broker.** No MC number or bond is required to dispatch. Carriers keep their own authority (MC/CVOR), insurance, and compliance.

---

## What's in this repo

```
northbound-dispatch/
├── website/              # Phase 1 — single-page landing site (static, Netlify-ready)
│   ├── index.html        #   6 sections: hero, how, why, pricing, about, apply
│   ├── css/styles.css    #   Northbound palette + typography, mobile-first
│   ├── js/main.js         #   nav, animated hero grid, form validation/submit
│   ├── assets/favicon.svg
│   ├── netlify.toml · robots.txt · sitemap.xml
│
├── documents/            # Phase 2 — branded PDFs (Python + ReportLab)
│   ├── brand.py          #   shared palette, fonts, header/footer flowables
│   ├── generate_carrier_agreement.py     # Carrier-Dispatcher Agreement
│   ├── generate_rate_confirmation.py     # Rate Confirmation template (fillable)
│   ├── generate_onboarding_checklist.py  # one-page onboarding checklist
│   ├── generate_referral_program.py      # referral program one-pager
│   ├── generate_business_card.py         # print-ready business card (front+back)
│   ├── build_all.py · requirements.txt
│   └── output/           #   generated PDFs (committed for convenience)
│
├── dispatch-tracker/     # Phase 3A — dispatch CRM (React via CDN, localStorage)
│   ├── index.html · app.jsx · tracker.css
│
├── playbook/             # Phase 3C — daily operations playbook (Markdown)
│   └── daily-operations-playbook.md
│
├── marketing/            # Phase 5 — carrier acquisition templates
│   ├── facebook-group-posts.md   (3 variations)
│   ├── kijiji-ad.md
│   ├── instagram.md              (bio + first 5 captions)
│   └── cold-outreach-scripts.md  (truck stops / schools / dealers)
│
└── docs/                 # strategy + supporting docs
    ├── business-plan.md            (strategy, unit economics, financials, milestones)
    ├── road-to-customer-1.md       (go-to-market sprint — land the first paying carrier)
    ├── production-deployment.md    (going-live checklist — Netlify, domain, email, form)
    ├── load-board-integration.md   (Phase 3B)
    └── ai-automation-roadmap.md     (Phase 4 — Sarah, OpenClaw, n8n)
```

---

## Quick start

### Website (Phase 1)
Pure static — no build step.
```bash
cd website
python3 -m http.server 8080   # then open http://localhost:8080
```
**Deploy to Netlify:** point a site at the `website/` folder (publish dir `.`, no build command — see `netlify.toml`). Public contact is `dispatch@northbounddispatch.ca`. Application-form submissions currently POST to `yorkis@goldenmaplelandscaping.ca` via FormSubmit (a verified, working inbox) — switch the form `action` to `dispatch@northbounddispatch.ca` once that inbox completes FormSubmit's one-time activation (or an n8n webhook replaces it).

### PDFs (Phase 2)
```bash
cd documents
pip install -r requirements.txt
python3 build_all.py          # writes all PDFs to documents/output/
```
Each generator also runs standalone, e.g. `python3 generate_carrier_agreement.py`.
> The Carrier-Dispatcher Agreement is a **template, not legal advice** — have it reviewed by a licensed Ontario attorney before use (the disclaimer is printed on the document).

### Dispatch Tracker (Phase 3A)
React + Babel via CDN, all data in browser `localStorage` — no backend.
```bash
cd dispatch-tracker
python3 -m http.server 8090   # then open http://localhost:8090
```
Click **"Load sample data"** in the sidebar to populate carriers/loads. Export/Import JSON for backup. Deployable to Netlify as-is.

**Dashboard views:** active carriers · loads pipeline · weekly revenue (fees per carrier) · carrier utilization · 30-day insurance-expiry warnings.

---

## Brand system

| Token | Value | Use |
|-------|-------|-----|
| Primary Dark | `#0D1B2A` | navy — authority, trust |
| Primary Accent | `#FF6B35` | burnt orange — energy, urgency |
| Secondary | `#1B998B` | teal — modern, tech-forward |
| Light BG | `#F7F7F7` | clean grey-white |

- **Headings:** Barlow Condensed Bold · **Body:** IBM Plex Sans · **Numbers/data:** Space Mono
- **Logo:** "NORTHBOUND" wordmark with an upward arrow mark; orange on navy.

---

## Pricing & positioning
- **Option A:** 8% of gross load revenue (standard)
- **Option B:** $200/week flat rate per truck (consistent runners)
- No setup costs, no hidden fees, week-to-week. Ontario domestic + Canada–US cross-border.
- All amounts CAD unless a cross-border load is explicitly quoted in USD.

## Business plan & roadmaps
- **Strategy & financials:** [`docs/business-plan.md`](docs/business-plan.md) — positioning, market, unit economics, cost structure, milestones, risks. Break-even is essentially Customer 1.
- **Go to market — Road to Customer 1:** [`docs/road-to-customer-1.md`](docs/road-to-customer-1.md) — the 14-day sprint to land the first paying carrier (Pre-flight → Outreach Blitz → Convert → Repeat). No automation required.
- **Going live:** [`docs/production-deployment.md`](docs/production-deployment.md) — Netlify + domain + email + form activation checklist.

## Roadmap (automation, next)
See `docs/ai-automation-roadmap.md`. Fastest first automation: **n8n insurance-expiry alerts** (the tracker already surfaces the 30-day list), then the onboarding flow (repoint the website form at an n8n webhook), then OpenClaw load matching against the Loadlink API.

---
*Independent dispatch service for owner-operators — not a freight broker. Barrie, Ontario, Canada.*
