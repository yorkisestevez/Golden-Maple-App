# LeanScaper AI vs. Golden Maple CRM + Foreman — Competitive Analysis

**Date:** 2026-05-20
**Branch:** `claude/leanscaper-competitive-analysis-RQAgX`
**Prepared for:** Golden Maple Landscaping / Foreman roadmap

---

## 0. Brutal-honesty reality check (read before the rest)

You briefed me as if Golden Maple CRM was a TypeScript/Express/React app with 135+ integration tests, a 14×4 automation engine with draft-then-approve queue, chase-overdue and weekly-digest skills, a premium client portal, and Ontario compliance. **The repo at `/home/user/Golden-Maple-App` does not match that description.** What's actually shipped:

- **Stack:** React 19 + Vite 6 SPA, Netlify Functions (2 of them: `gemini.js`, `presets.js`), Neon/Postgres + `pg`, `@google/genai` (Gemini). No Express server. The Next.js sub-project `estimate-ai/` is a separate app using Anthropic SDK + Supabase + Stripe + Resend.
- **Branding:** `package.json` calls it **"synkops---landscape-operations-pro"**, the onboarding wizard says "Welcome to SynkOps." This may be your internal codename; I'll keep using "Golden Maple CRM" externally but flag that the public artifact still says SynkOps.
- **Tests:** **Zero.** No `*.test.*` / `*.spec.*` files, no Jest/Vitest config. The "135+ integration tests" claim is unsupported by code on disk.
- **Automation engine (14 triggers × 4 actions, draft-then-approve, chase-overdue, weekly digest):** Not present. No queue/job runner, no trigger registry, no approval-queue table. Quick-actions in `lib/quickActions/jobContext.ts` are context resolvers, not automations.
- **Client portal:** Not present. The only "portal" string in the codebase is the Stripe billing portal inside `estimate-ai/`.
- **Ontario compliance:** Limited to an `hstPercent: 13` field in the setup wizard, a Vendor compliance panel (manual flags), and Permits/Locates UI. No WSIB integration, no ESDC, no MFIPPA hooks.

**What *is* genuinely shipped is still substantial** — and stronger than LeanScaper in several dimensions (see §4). But strategy built on a fictional baseline is dangerous, so the rest of this doc treats the shipped product as: *a React SPA with a rich data model (`types.ts` is 765 lines), full CRUD UIs for leads/jobs/proposals/invoices/change-orders/warranty/vendors/permits, an RBAC scaffold, a working AI estimator (Gemini), and a parallel public-facing estimator SaaS (`estimate-ai/`) with real Stripe + Supabase + Anthropic + Resend wiring.*

Foreman is a clean-slate planning layer. Good — that means most of the strategic recommendations below land in Foreman, not retrofits.

---

## 1. Executive summary

LeanScaper is **not a CRM and not a project-management system**. It's a **methodology-as-a-service** delivered through AI agents and a voice-first mobile huddle tool, sitting on top of QuickBooks. Mark Bradley scaled TBG Landscape to ~$50M and is selling the playbook (LeanScaper OS) wrapped in agents named Lana / Huddle / Marketing / CFO / HR / Operations. Their pricing model is **credits-based ($0.15/credit, free 250/month) with unlimited seats**, and a high-touch advisory layer ($2,400+/year fractional CEO program).

Golden Maple's shipped CRM is structurally **broader and more transactional** (leads → estimates → proposals → jobs → invoices → change orders → warranty), but **weaker on three axes LeanScaper has nailed**: (a) a memorable methodology to anchor the product to, (b) a voice-first field interface, and (c) QuickBooks. Foreman is the right layer to close (a) and parts of (b)/(c).

**The killer angle you can run that LeanScaper structurally cannot:** *AI that closes the loop on real money* — Foreman writing change orders, chasing AR, scheduling rain-outs, drafting proposals from site notes, all auto-billed through your own pipeline. LeanScaper is advisory + comms; you can be advisory + comms + transactional. See §7.

---

## 2. LeanScaper deep profile

### 2.1 Product surface

LeanScaper.com blocks unauthenticated HTML fetch (HTTP 403), so this profile is reconstructed from indexed search snippets of every page. Page list confirmed live:

- `/` — homepage
- `/platform` — top-level platform overview
- `/platform/ai-agents` — Lana + specialists
- `/platform/field-empowerment` — mobile + huddles
- `/platform/pricing` — credit-based pricing
- `/os` — LeanScaper Operating System (the methodology)
- `/advisory`, `/programs`, `/programs/starter`, `/programs/get-started` — coaching layer
- `/community` — free community + `community.leanscaper.com` (separate subdomain)
- `/blog`, `/podcast/...`, `/terms-and-conditions`
- `docs.leanscaper.com` — product docs
- Mobile apps: iOS (App Store ID 6754711316), Android (`com.leanscaper.mobile`)

### 2.2 Agent inventory (verified from search snippets)

| Agent | Role | What it actually does |
|---|---|---|
| **Lana** | Orchestrator / "AI deployment partner" | Front door; routes to sub-agents; answers from LeanDocs (their RAG store); hands-free voice; available in mobile + web |
| **Huddle Agent** | Voice → structured notes | Crew lead taps record at the morning huddle. Output: summary + wins + concerns + action items routed to the right kanban board |
| **LeanBoard Agent** | Field-request routing | Voice request from the truck → categorized → posted to a kanban board (Shop, Ops, etc.) before the next site |
| **Marketing Agent** | Campaign / website / brand strategy | Grounded in "real search data" — implies SERP/keyword tooling under the hood |
| **CFO Agent** | Forecasting + finance review | **Connects to QuickBooks**, helps interpret data, supports forecasting conversations |
| **HR / People Agent** | Job descriptions, recruiting strategy, compliance guidance | Workforce-specific to landscaping |
| **Operations Agent** | SOP review + gap-filling + 5-Star Service SOP generation | Writes SOPs directly into LeanScaper OS; automates post-service thank-yous, surveys, upsell triggers |
| **Custom Agents** | User-defined | Trained on uploaded LeanDocs (your SOPs, templates, policies) |

Lana also "flags gaps between CRM, Accounting, and PM systems" — which means **LeanScaper does not own the CRM/PM data; it sits across whatever the customer already uses**. That's a structural choice worth noting (see §6).

### 2.3 Methodology layer (LeanScaper OS)

- Built by Mark Bradley while scaling TBG Landscape to ~$50M (Top 100 N.A. landscape co).
- Four pillars: **Operations, Finance, People, Customer**.
- Delivered through "plug-and-play" SOPs, KPIs, scorecards, role definitions, job-costing templates, meeting cadences, knowledge hub.
- Storage primitive: **LeanDocs** (SOPs/policies/templates uploaded by the customer; doubles as the AI's RAG corpus).
- Boards primitive: **LeanBoards** (kanban for field/office work).

This is **the real differentiator** — they're selling a battle-tested ops system, with the AI as the delivery mechanism. Software is the wrapper.

### 2.4 Pricing (confirmed)

- **Free tier:** 250 credits/month, no card. Unlimited users on all plans.
- **Credit top-ups:** $150 / 1,000 credits → $0.15 per credit.
- **Subscription tiers** (segmentation, not dollar amounts — actual monthly $ not surfaced in indexable copy):
  - **Core** — 1–3 crew operations
  - **Premium** — 4–8 crew, active daily usage
  - **Max** — 9–15 crew, deploying AI company-wide
- Different actions consume different credit amounts; balance visible to user; month-to-month, no long-term contract.

**Advisory layer (separate):**
- **Accelerator** — from **$2,400/year**, scaled to company revenue; weekly leadership program; Mark Bradley as fractional CEO; "roll-up-your-sleeves working sessions."
- **Advisor Program** — higher tier, surrounds you with experienced operators by enterprise-value dimension. No price found.

### 2.5 Target customer

**1–15 crew landscaping companies (~$500K–$15M revenue)**, with a clear push toward owners/managers who want methodology, not just software. The fractional-CEO advisory layer is a strong tell that **their ideal customer is the owner-operator who wants a thinking partner, not just an inbox**.

### 2.6 Integrations (confirmed)

- **QuickBooks** — confirmed for the CFO Agent
- **iOS + Android mobile apps** — confirmed live
- **Web app** — confirmed
- **LeanDocs upload** — user-managed RAG
- **No public mention of:** Google Workspace, Stripe, Twilio/SMS, Calendly, Slack, Zapier, Make, payment processors, e-sign

### 2.7 Tech-stack clues (inferred, low confidence)

- 403 with browser UA suggests **CDN-level bot blocking (Cloudflare/Fastly/AWS WAF)** — not behavior of a static Webflow site, so likely a hosted SPA behind a CDN.
- App store entry exists for both iOS and Android with separate bundle IDs → **real native or React Native shell**, not a PWA.
- Voice + structured output for huddles → **Whisper-class transcription + LLM extraction**.
- "Real search data" for the Marketing Agent → **SERP API (DataForSEO / SerpAPI / Google Ads API)**.
- "Connect QuickBooks" → **Intuit OAuth + QBO API**.
- Multi-agent orchestration + per-action credit metering → suggests a **token-metered LLM proxy** (OpenAI/Anthropic API at minimum), not a self-hosted model.

### 2.8 Onboarding

- Free account, **no credit card, no demo call required** ("instant" / "no setup calls" claim is consistent with search snippets).
- Upload LeanDocs to bootstrap company knowledge; Lana learns as you use the platform.
- iOS/Android download for field; web for "strategic planning."

### 2.9 Positioning (verbatim themes from indexed copy)

- "First AI-powered platform purpose-built for the landscape industry."
- "The operating system that helps landscape contractors become market leaders."
- "Battle-tested systems… from one of North America's Top 100 landscape companies."
- "Your voice becomes documentation."
- "Lana knows your business."
- "No more chasing or guessing."

Consistent tone: **methodology + voice-first field + agent specialists**. They do **not** position as a CRM or as a project-management replacement.

### 2.10 Reviews / social proof

- Free community at `community.leanscaper.com` (events, FAQ, podcast guests visible in search).
- Podcast: *The LeanScaper Podcast* (Apple Podcasts).
- YouTube channel: `@leanscaper`.
- Specific customer testimonials / G2 / Capterra reviews **not surfaced** in any search — this is a young product (mobile app id is in the 6.7B range, consistent with 2024-2025 launch). Treat their market traction as **early but credible**, anchored by Mark Bradley's existing industry credibility.

---

## 3. Golden Maple CRM (shipped) — actual feature inventory

Compiled from the codebase. Where I list a feature, it's because UI + types are in the repo; that does not always mean it's wired end-to-end or covered by tests (there are no tests).

| Area | What's actually in the repo |
|---|---|
| **Lead pipeline** | 10-stage Kanban: NEW → CONTACTED → SITE_VISIT_BOOKED → ESTIMATE_IN_PROGRESS → QUOTE_SENT → FOLLOW_UP_DUE → WON / LOST. `nextActionDate` field. Lead↔Job conversion. `localStorage` key `synkops_leads_v1` (i.e., persistence is browser-local, not server-side, in the main app). |
| **Jobs** | 11 statuses incl. PUNCHLIST + WARRANTY. Geofencing (`siteLat/siteLng/geofenceRadiusMeters`). Gates (locates, materials, deposit, plan). Workspace tabs: Overview, Cost Analysis, Permits, Checklists, Daily Logs, Photos. Daily-log fields incl. `clientInteractionNotes`, `tomorrowPlan`. |
| **Estimates** | EstimateBuilder UI; AI assist via Gemini (`lib/ai/estimator.ts` → `/.netlify/functions/gemini`). |
| **Proposals** | DRAFT → SENT → VIEWED → ACCEPTED → DECLINED; sectioned (Hero, Scope, Materials, Process, Timeline, Investment, Warranty, Signature). |
| **Invoices** | 7 statuses incl. READY_TO_SEND, PARTIALLY_PAID. Payment methods: e-transfer / cash / cheque / credit card / bank transfer. Internal — **no QuickBooks/Xero sync.** |
| **Change Orders** | DRAFT → PENDING_APPROVAL → APPROVED → SENT → SIGNED → DECLINED. Reasons enum. Signature capture (typed). |
| **Warranty** | 7 statuses, policy-based, visit reports with root-cause categorization, denial reasons. Mature data model. |
| **Permits & Locates** | Status tracking, authority assignment, inspections, attachments. |
| **Vendors / Procurement** | Suppliers, subs, rental, disposal. Compliance flags (WSIB present **as flag only**, insurance). Pricebooks, POs, material requests. |
| **Templates** | Versioned templates for proposal / change order / warranty / daily log with variable interpolation. |
| **Reports** | 9 tabs (Executive, Sales, Production, Financials, Change Orders, Warranty, Vendors, Compliance, Builder). CSV export. Owner-only. |
| **DataCenter** | Capacity heatmap, financial metrics, items usage, labor metrics, proposal summary, visit notes. |
| **Settings** | Catalog, CostCodes, Financial (FinancialBrainPanel), HR (CrewHRPanel), Integrations (Google Workspace), Production (ProductionRatesManager). |
| **Integrations** | Google Workspace (OAuth-popup, services: calendar/gmail/drive/sheets/contacts/maps, calendar sync modes). No SMS. No QuickBooks. No Stripe in main app. |
| **RBAC** | 5 roles: OWNER / OFFICE / FIELD_LEAD / CREW / SUB. Per-employee flags `canApproveChangeOrders`, `canViewFinancials`. Role-gated UI. |
| **AI** | Gemini for estimate assist (main app). Anthropic `claude-sonnet-4-20250514` for design-insight copy (estimate-ai sub-app). |
| **`estimate-ai/` sub-app** | Standalone Next.js 16 SaaS: multi-step public estimator → lead capture → email via Resend → 3 Stripe tiers ($97 / $197 / $497) → Supabase auth, embed widget, billing portal. **This is the most production-ready SaaS surface in the whole repo.** |
| **Mobile** | None. No PWA manifest, no React Native, no Capacitor. Responsive web with Tailwind. |
| **Onboarding** | 3-step SetupWizard (company name, tax %, deposit %, labor rates, markup) — fast, no demo call needed. |
| **Automation engine** | **Not present.** |
| **Client portal** | **Not present.** |
| **Tests** | **None.** |

---

## 4. Feature-to-feature comparison matrix

Legend: ✅ shipped & wired, 🟡 partial / UI-only / placeholder, 📋 planned for Foreman, ❌ missing.

| Feature | LeanScaper | GM CRM (shipped) | Foreman (planned) | Gap? |
|---|---|---|---|---|
| **Lead pipeline / CRM core** | ❌ (not their game) | ✅ 10-stage kanban, full CRUD | 📋 reasoning over leads | **Your advantage** |
| **Client database** | 🟡 via LeanDocs only | ✅ structured records | 📋 enrichment | **Your advantage** |
| **Estimates / takeoff** | 🟡 Lana drafts text | ✅ structured + Gemini assist | 📋 site-photo → estimate | **Your advantage** |
| **Proposals (structured, sectioned, signature)** | ❌ | ✅ | 📋 personalization at scale | **Your advantage** |
| **Job scheduling (calendar, capacity)** | ❌ (routes to kanban only) | ✅ Schedule + CapacityHeatmap | 📋 rain-out reshuffle | **Your advantage** |
| **Crew/job geofencing** | ❌ | ✅ | — | **Your advantage** |
| **Change orders w/ signature** | ❌ | ✅ | 📋 auto-draft from site notes | **Your advantage** |
| **Warranty workflow** | ❌ | ✅ rich model | — | **Your advantage** |
| **Permits / locates tracking** | ❌ | ✅ | — | **Your advantage** |
| **Vendor / PO / pricebook** | ❌ | ✅ | — | **Your advantage** |
| **Invoicing** | ❌ (rely on QB) | ✅ internal | 📋 AR chase | **Your advantage** |
| **Payments** | ❌ | 🟡 Stripe only in estimate-ai sub-app | 📋 wire into main app | **Tie** |
| **Reporting / dashboards** | 🟡 CFO Agent talks about numbers | ✅ 9-tab Reports + DataCenter | 📋 narrative reports | **Your advantage** |
| **Multi-role RBAC (Owner / Office / Lead / Crew / Sub)** | 🟡 unlimited seats, soft roles | ✅ 5-role enforced | 📋 per-agent permissions | **Your advantage** |
| **AI orchestrator (single front door)** | ✅ Lana | ❌ | 📋 Foreman (OpenClaw) | **Their advantage today** |
| **Specialized sub-agents (Marketing, CFO, HR, Ops)** | ✅ named & shipped | ❌ | 📋 partially | **Their advantage** |
| **Voice-first field capture (huddle → structured)** | ✅ Huddle Agent | ❌ | 📋 high-value addition | **Their advantage** |
| **Kanban field-request routing** | ✅ LeanBoards | 🟡 Jobs board exists | 📋 from voice/SMS | **Their advantage** |
| **Native mobile app (iOS + Android)** | ✅ | ❌ | 📋 must-have | **Their advantage** |
| **SOP / playbook generation** | ✅ Ops Agent + LeanDocs | ❌ | 📋 | **Their advantage** |
| **QuickBooks integration** | ✅ | ❌ | 📋 | **Their advantage** |
| **Methodology + branded OS narrative** | ✅ LeanScaper OS, 4 pillars | ❌ | 📋 unclear | **Their advantage** |
| **Marketing strategy agent (SERP-grounded)** | ✅ | ❌ | 📋 | **Their advantage** |
| **HR / hiring agent** | ✅ | ❌ | 📋 | **Their advantage (low priority for you)** |
| **Client portal (proposals, invoices, photos)** | ❌ | ❌ | 📋 high-value | **Both miss it — green-field** |
| **e-Sign for proposals/COs** | ❌ | 🟡 typed signature only | 📋 | **Both weak — green-field** |
| **SMS / call automation** | ❌ | ❌ | 📋 | **Both weak — green-field** |
| **Weather-aware scheduling** | ❌ | 🟡 `weatherScanner.ts` exists, not wired | 📋 | **Both weak — your shipped scaffold gives you a head start** |
| **Automation engine (triggers/actions/approval queue)** | 🟡 some automations claimed (post-service thank-yous, surveys) | ❌ | 📋 critical | **Their advantage in narrative, both weak in depth** |
| **Onboarding speed (no-call signup)** | ✅ free 250 credits | ✅ 3-step wizard | — | **Tie** |
| **Pricing transparency** | ✅ credits visible, free start | 🟡 only `estimate-ai` has tiers | — | **Their advantage** |
| **Test coverage** | unknown | ❌ 0 tests | — | **Your liability** |
| **Compliance (Ontario WSIB / HST / MFIPPA)** | ❌ | 🟡 HST field + manual WSIB flag | 📋 | **Both weak — but you have geographic specificity to exploit** |

---

## 5. Gaps where LeanScaper wins (ranked by revenue impact)

Brutally honest. These are the things that would make a paying landscape contractor pick LeanScaper over Golden Maple today.

### 5.1 Top gaps — close these or lose deals

1. **Native mobile app for crews + voice-first huddle capture.**
   This is the single biggest moat LeanScaper has built. "Crew lead taps record at 6:45am, office has a summary at 7:00am" is a story owners *can picture*. You have no mobile app and no voice path. **Revenue impact: very high.** This is the demo that closes 1–5 crew owners.

2. **A named methodology (LeanScaper OS) that customers can latch onto.**
   You sell features; they sell *a system that scaled a $50M company*. Even if your product is structurally better, "what's the framework?" wins discovery calls. **Revenue impact: high.** Foreman needs a story, not a SKU list.

3. **QuickBooks integration.**
   Every serious landscape contractor uses QuickBooks. Their CFO Agent reading QBO data is concrete value on day one. You're missing it entirely. **Revenue impact: high** for >$1M revenue customers.

4. **A single AI front door (their "Lana").**
   You have Gemini estimating in one place and Claude generating insight in another, with no unifying agent. Foreman is the right answer — but unbuilt. **Revenue impact: high** because it's how you tell the AI story at all.

5. **Specialized sub-agents for non-CRM domains (Marketing, HR/Hiring, Ops/SOPs).**
   These three are sellable on their own. SOP generation alone is a feature an owner will pay for. **Revenue impact: medium-high.** Marketing/HR agents are lower priority for hardscape buyers than for maintenance buyers.

### 5.2 Mid-tier gaps

6. **Kanban-routed field requests from voice/SMS.** You have a Jobs module but not a "speak it from the truck, it's on the right board" loop.
7. **LeanDocs equivalent — uploaded RAG store of company SOPs.** No knowledge-base ingestion in the repo.
8. **Pricing page for the main product.** Only `estimate-ai/` has visible pricing ($97 / $197 / $497). Main app shows no SKUs.
9. **Community + content moat** (podcast, weekly events, free assessment). They're building demand-gen at the category level.

### 5.3 Liability-level gaps

10. **Zero tests.** Not a feature gap — a credibility gap when you start hiring or fundraising. LeanScaper's reliability is unknown but your code's reliability is *demonstrably untested*.
11. **Main-app data lives in `localStorage`.** Multi-device, multi-user, audit-trail = currently broken for shipped customers. Probably already known internally; called out because it constrains any "AI on top" story.

---

## 6. Where you already win (and where you can widen the lead)

### 6.1 Structural advantages they can't easily clone

1. **You own the transactional layer.** Leads → estimates → proposals → invoices → change orders → warranty. LeanScaper *explicitly* doesn't — they sit on top of whatever CRM/PM the customer brings. **This means every dollar moves through your product, not theirs.** Foreman pulling levers on real revenue is materially more valuable than Lana giving advice.

2. **You run a real landscaping company.** Mark Bradley *also* did — that's their moat. But you can match it (Simcoe County, premium hardscape) *and* you ship the software you use. That's the dogfooding story they can't reproduce without a second business.

3. **You own OpenClaw.** Foreman as an OpenClaw orchestrator means you can ship multi-agent behavior LeanScaper has to build on top of a metered LLM proxy. If OpenClaw can do anything non-trivial (parallel tools, cheaper local models for routing, durable memory) you have a cost-structure advantage on the per-credit pricing they've boxed themselves into.

4. **Hardscape specificity vs. landscape generality.** LeanScaper targets the whole industry. You can win premium hardscape (higher AOV, sticker-shock proposals, structural permits, longer warranties, change-order-heavy) with a product that *defaults to hardscape*. Materials calc, permit/locate workflow, retaining-wall engineering touchpoints, paver/stone catalogs, warranty around frost-heave — none of that is in LeanScaper.

5. **Ontario regulatory specificity.** WSIB clearance letters, MFIPPA-compliant client data handling, HST handling, ESA inspection touchpoints, locate-service (Ontario One Call) workflow. None of which LeanScaper handles. Becoming the "Ontario hardscape stack" is a defensible regional play. (Your repo has the *placeholders* — `WSIB` flag, `hstPercent`, Permits/Locates — but not the wiring.)

6. **Estimate-ai is already a working public-facing SaaS shell.** Stripe, Supabase auth, Anthropic, Resend, embed widget, multi-tier pricing — you've shipped more usable revenue plumbing in `estimate-ai/` than is visible publicly on LeanScaper. Lean into this.

### 6.2 What you should *not* compete on

- Generic landscape advisory / coaching — Mark Bradley's industry credibility is real.
- Marketing/HR agents for the full industry — table stakes that pull you off mission.
- General community building — they have a 12-18 month head start.

---

## 7. Strategic build priorities (prioritized, with layer assignment)

Each item: *what / why / complexity / where it lives.*

### Priority 0 — Stabilize the baseline (before adding features)

| # | Item | Why | Complexity | Layer |
|---|---|---|---|---|
| 0.1 | Move main-app state out of `localStorage` into Neon/Postgres with a proper API layer | Multi-user, audit trail, and any AI write-back requires it. Foreman literally cannot operate against `localStorage`. | 2–3 weeks | CRM |
| 0.2 | Add a tests baseline (Vitest + Playwright) on the lead → proposal → invoice path | "0 tests" is a credibility risk and blocks safely letting an AI write to the DB. Aim for the 50-test floor on the money paths before claiming "automation engine." | 1–2 weeks | CRM |
| 0.3 | Decide on the public product name (SynkOps vs Golden Maple CRM vs something new) and fix it across `package.json`, onboarding wizard, marketing | You're going to market — pick one. | 1 day | CRM |

### Priority 1 — Match LeanScaper's two most demo-able strengths (this quarter)

| # | Item | Why | Complexity | Layer |
|---|---|---|---|---|
| 1.1 | **Field mobile app + voice huddle capture.** Capacitor wrapper around the SPA (cheap path) OR Expo/React Native if you need offline. Whisper-class transcription → Claude extraction → posts a Daily Log + routes action items into Jobs / Schedule / Vendors as appropriate. | LeanScaper's single biggest moat. Closes the 1–5 crew demo. | 4–6 weeks for Capacitor + voice pipeline | CRM (capture) + Foreman (extract & route) |
| 1.2 | **Foreman as the single front door.** One chat surface in the app (web + mobile). Reads everything; writes via the draft-then-approve queue (which you still need to build). Sub-skills: estimate-from-site-notes, proposal-from-template, AR-chase, rain-day-reshuffle, change-order-from-photo-note. | This is the AI story. Without it you're "a landscape CRM"; with it you're "the landscape ops AI". | 6–10 weeks for v1 with ≥3 skills | Foreman |
| 1.3 | **Name and ship a methodology.** "The Golden Maple Hardscape Operating System" or similar — 4–6 pillars, opinionated KPIs/scorecards baked into the Reports module. Doesn't need to be original; needs to be *named* and *yours*. | Lets you compete with LeanScaper OS on framing. Pulls Reports/DataCenter into a story. | 1–2 weeks of writing + 2 weeks of UX wiring | CRM positioning |

### Priority 2 — Close the integration gaps (next quarter)

| # | Item | Why | Complexity | Layer |
|---|---|---|---|---|
| 2.1 | **QuickBooks Online integration.** OAuth, customers + invoices + payments + classes sync. Foreman CFO skill reads it. | The single most-asked-for integration in this industry. | 3–5 weeks | CRM (sync) + Foreman (read) |
| 2.2 | **Real e-signature on proposals + COs.** Replace typed-name with embedded signature widget; legally defensible audit trail. | Removes a deal-blocker for higher-ticket projects. | 1–2 weeks | CRM |
| 2.3 | **Client portal.** Read-only: proposal status, schedule, photos, invoices, change-order approvals. Magic-link auth. | LeanScaper doesn't have one either — green-field for you. Premium-client expectation. | 4–6 weeks | CRM |
| 2.4 | **SMS rails (Twilio).** Lead-capture autoresponse, day-before reminders, on-the-way text, AR chase. Foreman drafts, queue approves, Twilio sends. | Hardscape clients live on text. LeanScaper has no SMS story. | 2–3 weeks | CRM (rails) + Foreman (draft) |

### Priority 3 — Differentiation moves (6–9 months out)

| # | Item | Why | Complexity | Layer |
|---|---|---|---|---|
| 3.1 | **Site-photo → estimate.** Foreman takes 4–6 site photos + dimensions, generates a structured estimate with materials, labor hours, and a draft proposal. | This is the "wow" demo that doesn't exist anywhere in the industry yet. You have the estimator scaffold (`lib/ai/estimator.ts`) already. | 4–8 weeks | Foreman |
| 3.2 | **Weather-aware scheduling.** Wire up the `weatherScanner.ts` stub. Foreman reshuffles the week's plan when 14mm rain hits Thursday. | The scaffold is in the repo. Finish it. | 2–3 weeks | Foreman |
| 3.3 | **Ontario compliance pack.** WSIB clearance auto-verify, Ontario One Call locate integration, MFIPPA-aware client data export. | Regional moat. None of your US-leaning competitors care. | 3–6 weeks | CRM |
| 3.4 | **SOP / knowledge ingestion ("MapleDocs" — your LeanDocs).** Upload SOPs/policies → Foreman uses them as RAG. | Cheap parity move. Defangs the "they have LeanDocs" objection. | 2–3 weeks | Foreman |
| 3.5 | **Hardscape-native catalog of materials and assemblies** (paver lines, retaining-wall systems, drainage, lighting) with regional pricing. | Industry-vertical moat. Lets the estimator AI be *useful*, not generic. | Ongoing; first cut in 2–4 weeks | CRM |

### What *not* to build

- Generic Marketing Agent and HR Agent. Don't follow them off-mission. If a customer needs hiring help, point them at a hiring tool. Stay on revenue + ops.
- Generic community / podcast / "advisory program." Mark Bradley owns that lane. You can write a great blog later.

---

## 8. Positioning — how to go to market against LeanScaper

### 8.1 The killer angle

**"LeanScaper teaches you what to do. Golden Maple does it."**

LeanScaper's product loop is: *crew talks → notes appear → boards updated → owner reads the summary → owner takes action.* The action is still manual. The CFO Agent *talks about* the numbers; it doesn't move them.

Your loop is the same first 80% — *crew talks → notes appear → boards updated* — **plus the last 20% LeanScaper can't reach**: Foreman *drafts the change order*, *sends the proposal*, *chases the overdue invoice*, *reshuffles the week for the rain-out*, *upcharges the upsell trigger Lana would just suggest*. Same advisory layer, plus the transactional layer they don't own.

That's the one-sentence pitch: *"AI that doesn't just tell you what to do — it does it, in your approval queue, on Monday morning."*

### 8.2 Three positioning pillars to use externally

1. **Built by an operator, for operators — and the software runs the operator's company.** "We use it every day in Simcoe County on premium hardscape." LeanScaper has Mark's TBG story; you have a *current* dogfooded story. That's stronger.
2. **End-to-end revenue: leads → invoice paid → warranty closed. One product, one source of truth.** LeanScaper sits on top of QuickBooks + a CRM + a PM tool you have to bring. You replace those with one stack. (Until you do that credibly, this is aspirational — see Priority 0.1.)
3. **Hardscape-specific, Ontario-native.** Bigger AOV, longer warranties, change-order-heavy, permit/locate workflow built in, WSIB+HST handled. LeanScaper is generic North American landscape.

### 8.3 Pricing posture

LeanScaper is **credits + unlimited seats + free start**. That's a fair model — but it caps their per-customer ceiling and forces them to keep agents lightweight to control credit burn.

You should do something deliberately *different*:

- **Flat per-crew pricing (not per seat, not per credit).** "$X/month per active crew, unlimited everything." Aligns price with value (more crews = more jobs = more revenue Foreman touches). Avoids the "should I send Foreman that long prompt?" hesitation.
- **Free during the trial; production AI usage included in the plan.** You eat the LLM cost out of the margin instead of metering it. Lets you say "Foreman is always on; never billed twice."
- **`estimate-ai/` as a public lead-magnet SKU** at the existing $97 / $197 / $497 tiers — that's already a separate product. Don't conflate it with the ops product.

### 8.4 What to say when prospects ask "why not LeanScaper?"

Three honest lines:

> *"LeanScaper teaches the system; we run it. If you want the playbook and weekly coaching from a $50M operator, Mark's program is excellent. If you want a tool that closes the loop — drafts the proposal, sends it, chases the deposit, reshuffles the week when it rains — that's us."*
>
> *"We're hardscape-first and Ontario-native. They're built for the whole continent."*
>
> *"They sit on top of QuickBooks and your CRM. We *are* the CRM, plus a working AI orchestrator. One stack, one source of truth, one log of who-did-what."*

---

## 9. Risk register

- **Mobile / voice is the single biggest catch-up item.** If you don't ship 1.1 in this quarter, every demo will end with "but does it work on my phone like LeanScaper's huddle thing?"
- **0.1 (state-out-of-localStorage) is non-optional.** Every other recommendation depends on a real DB.
- **The `estimate-ai/` sub-app is a parallel product with different stack assumptions (Anthropic, Supabase, Stripe, Resend, Next.js).** Decide before Foreman work starts: is this the production stack and the main app gets ported, or is it a separate lead-gen widget that's not part of the ops product? Treating it ambiguously will cost weeks.
- **OpenClaw is the unknown.** If it's not production-ready for tool calling + memory + cost control, Foreman will need a fallback (LangGraph/Anthropic Agents/native Claude tool use). Plan for a 2-week spike before committing the Foreman milestone.
- **The "Golden Maple" vs "SynkOps" naming inconsistency will cost you trust** if a prospect lands on the wizard and sees a different brand than they signed up for. Fix in week one.

---

## 10. One-week action list

If this doc only changes one week, change this one:

1. **Decide the product name once.** Push the rename through `package.json`, onboarding wizard, README, marketing copy.
2. **Decide: is `estimate-ai/` the production stack, the lead-gen widget, or merged into the main app?** Write the answer down somewhere durable.
3. **Spike Capacitor over the existing SPA for a 1-day "does it install on my iPhone" test.** This validates the cheapest path to a mobile presence.
4. **Spike voice → structured huddle capture** in a 1-day prototype: phone records audio → Whisper API → Claude extracts → posts to Jobs. Doesn't need to be in-app; needs to prove the loop.
5. **Write the "Golden Maple Hardscape Operating System" v0 — five pillars, one page each.** Methodology before code.
6. **Pick the three Foreman skills you'd demo first.** My nomination: (a) rain-day reshuffle, (b) draft change-order from a daily-log photo + caption, (c) AR-chase queue. All three close the loop LeanScaper can't.
7. **Stand up a Vitest + Playwright skeleton with one passing test per money path** (lead create, proposal send, invoice mark-paid). Five tests. Today.

---

## 11. Sources

LeanScaper.com returns HTTP 403 to unauthenticated browser-UA fetch, so every quoted snippet below came through Google search-result indexing. Where I marked a claim "confirmed," it appeared verbatim across two or more of these sources.

- [LeanScaper homepage](https://leanscaper.com/) — top-line positioning
- [LeanScaper Platform](https://leanscaper.com/platform) — agent overview
- [LeanScaper AI Agents](https://leanscaper.com/platform/ai-agents) — Lana + sub-agents
- [LeanScaper Field Empowerment](https://leanscaper.com/platform/field-empowerment) — huddle agent, kanban routing, mobile
- [LeanScaper Pricing](https://leanscaper.com/platform/pricing) — credit pricing, tiers, top-ups
- [LeanScaper OS](https://leanscaper.com/os) — methodology, four pillars
- [LeanScaper Advisory](https://leanscaper.com/advisory) — fractional CEO program
- [LeanScaper Programs / Accelerator](https://leanscaper.com/programs) — $2,400/yr starting point
- [LeanScaper AI Docs](https://docs.leanscaper.com) — LeanDocs, working with AI
- [LeanScaper iOS App](https://apps.apple.com/us/app/leanscaper-ai/id6754711316) — confirmed native iOS app
- [LeanScaper Android App](https://play.google.com/store/apps/details?id=com.leanscaper.mobile) — confirmed native Android app
- [LeanScaper FAQ on community.leanscaper.com](https://community.leanscaper.com/topics/38696/page/leanscaperai-faq) — credit costs, free tier
- [Mark Bradley LinkedIn](https://www.linkedin.com/in/mark-bradley-13a799102/) — TBG / Top 100 background
- [What is LeanScaper podcast](https://leanscaper.com/podcast/what-is-leanscaper-w-mark-bradley) — methodology origin
- [Q&A: Unlocking LeanScaper AI](https://www.youtube.com/watch?v=YWwQJfhlg_U) — Lana feature demo

**Internal sources:**
- Golden-Maple-App repo at `/home/user/Golden-Maple-App`, branch `claude/leanscaper-competitive-analysis-RQAgX`. Inventory cross-checked against `package.json`, `types.ts`, `components/*`, `lib/*`, `estimate-ai/package.json`, `estimate-ai/app/*`, and grep across automation/portal/test patterns.
