# Northbound Dispatch — Business Plan

> **Your loads. Found. Confirmed. Done.**
> Asset-light AI-powered truck dispatch for Ontario owner-operators.
> Barrie, Ontario · Owner/Operator: Yorkis Estevez · Drafted 2026-06-09

This is the single strategic + financial reference for the business. Operational detail
lives in [`playbook/daily-operations-playbook.md`](../playbook/daily-operations-playbook.md);
the automation buildout lives in [`docs/ai-automation-roadmap.md`](./ai-automation-roadmap.md);
the customer-acquisition sprint lives in [`docs/road-to-customer-1.md`](./road-to-customer-1.md).

> Financial figures below are **planning estimates and assumptions**, not guarantees.
> All amounts CAD unless a cross-border load is explicitly quoted in USD.

---

## 1. Executive Summary

Northbound Dispatch finds, negotiates, and confirms freight loads for independent
owner-operators across Ontario domestic and Canada–US cross-border lanes. We are a
**dispatch service, not a freight broker** — carriers keep their own authority (MC/CVOR),
insurance, and compliance. No MC number or bond is required to dispatch, which means the
business can start **immediately and legally** with near-zero capital.

The moat is an **AI automation layer** (voice agent, load-matching agent, n8n workflows)
that lets one operator profitably dispatch **15–20 trucks** where a traditional dispatcher
handles 5–7. We earn the same per-truck fee at 3x the operator leverage.

- **Revenue model:** 8% of gross load revenue, or $200/week flat per truck.
- **Cost structure:** asset-light. No vehicles, no warehouse. Sub-$300/month tooling to start.
- **Break-even:** essentially **Customer 1** — a single active carrier covers monthly tooling.
- **90-day goal:** 5+ active carriers, $3,000+/month in dispatch fees, 1 automation live.

---

## 2. The Problem

Owner-operators are great drivers and poor freight-finders. After buying a truck they hit a wall:

- **Empty trucks lose money.** Every deadhead mile and idle day is unrecoverable revenue.
- **Load boards are a full-time job.** Searching, scoring, and negotiating eats the hours a
  driver should spend driving (and resting legally).
- **Brokers negotiate against them.** Without a dispatcher working *for the truck*, carriers
  leave money on the table on every load.
- **New owner-ops are most exposed.** Driving-school grads who finance their first truck can
  drive but can't keep it loaded profitably in week one.

The dispatcher's job is to keep the truck loaded at the best rate, so the carrier just drives.

---

## 3. The Solution

Northbound dispatches loads for owner-operators: find loads matched to each truck's lanes and
equipment, negotiate rate with the broker, send a rate confirmation, and manage the load to
delivery — for a simple weekly-cancellable fee.

**What makes it different — the AI layer (the moat):**

| Capability | Traditional dispatcher | Northbound |
|---|---|---|
| Trucks per operator | 5–7 | 15–20 (target) |
| Load board scanning | Manual, all day | OpenClaw agent scores + ranks (Phase 4B) |
| Inbound "any loads?" calls | Operator answers each one | "Sarah" voice agent (Phase 4A) |
| Onboarding / invoicing / alerts | Manual | n8n workflows (Phase 4C) |
| CRM | Spreadsheet / memory | Dispatch Tracker (this repo) |

Every month the automation layer takes more of the daily playbook off the human, which is
how per-operator truck capacity climbs without adding headcount.

---

## 4. Market

- **Primary:** Independent owner-operators based along the Hwy 400 corridor and GTA (Barrie,
  Innisfil, Bradford, Newmarket, Vaughan), running dry van / flatbed / reefer / step deck.
- **Beachhead channel:** **AZ driving schools** — new owner-ops need a dispatcher the day they
  buy a truck. Best long-term, highest-intent channel (see `marketing/cold-outreach-scripts.md`).
- **Lanes:** Ontario domestic first (Loadlink coverage is strongest), then Canada–US
  cross-border as volume justifies DAT One.
- **Why now / why us:** local presence in Barrie, a shared AI stack with Golden Maple
  (voice agent + n8n already proven), and a productizable agent platform (OpenClaw).

---

## 5. Revenue Model & Unit Economics

**Pricing (per truck, week-to-week, no setup fee):**
- **Option A — 8% of gross load revenue** (standard; scales with the carrier's earnings).
- **Option B — $200/week flat per truck** (for consistent high-volume runners who want a
  predictable cost; caps our upside in exchange for guaranteed recurring revenue).

**Per-truck economics (illustrative, conservative assumptions):**

| Assumption | Value |
|---|---|
| Avg. carrier gross revenue / week | ~$6,000 |
| Dispatch fee @ 8% | ~$480 / truck / week |
| Flat-rate alternative | $200 / truck / week |
| **Blended planning fee (ramp + partial utilization)** | **~$300 / truck / week** |
| Monthly fee per active truck (×4.3 weeks) | **~$1,290** |

> The blended ~$300/week figure deliberately discounts the headline 8% for ramp, partial-week
> utilization, and a mix of flat-rate carriers. Use it for planning; real fees trend higher per
> truck as utilization improves.

**Monthly revenue model:**

| Active carriers | Conservative (~$300/truck/wk) | Target (8% on ~$6k/wk) |
|---|---|---|
| 1 | ~$1,290 | ~$2,064 |
| 3 | ~$3,870 | ~$6,192 |
| 5 | ~$6,450 | ~$10,320 |
| 10 | ~$12,900 | ~$20,640 |
| 15 | ~$19,350 | ~$30,960 |

The 90-day **$3,000+/month** target lands between 3 and 5 active carriers on conservative
assumptions — well inside one operator's manual capacity, before the AI layer is even required.

---

## 6. Cost Structure

Asset-light by design. No trucks, no lot, no employees to start.

| Item | When | Monthly (CAD, est.) |
|---|---|---|
| Loadlink subscription | Day 1 | $100–150 |
| Domain (northbounddispatch.ca) | Day 1 | ~$1.25 (≈$15/yr) |
| Website hosting (Netlify free tier) | Day 1 | $0 |
| Business email | Day 1 | $0–8 |
| Telnyx phone number | Phase 4A | ~$5 |
| n8n (cloud or self-host) | Phase 4C | $0–20 |
| ElevenLabs voice | Phase 4A | ~$22 |
| DAT One | when cross-border justifies | $150+ |
| Business cards / print | one-time | ~$50 |
| **Starting monthly burn (pre-automation)** | | **~$110–180** |

**Break-even:** a single active carrier at 8% (~$480/week) covers the entire starting monthly
burn in **one week**. The business is cash-flow positive at **Customer 1**.

---

## 7. Competitive Landscape

| Competitor type | Their model | Northbound edge |
|---|---|---|
| Traditional dispatch services | Manual, 5–7 trucks/operator, often 10% | AI leverage → lower cost to serve, room to price at 8% |
| Freight brokers | Hold freight, take the spread | We work *for the truck*, transparent fee, carrier keeps authority |
| In-house (owner-op self-dispatch) | Free but time-expensive | We give back driving hours and negotiate better rates |
| Large dispatch firms | Volume, less personal | Local Barrie presence, week-to-week, no lock-in |

**Positioning:** the local, no-lock-in, AI-fast dispatcher who earns your truck every week.

---

## 8. Go-to-Market (summary)

Full sprint in [`docs/road-to-customer-1.md`](./road-to-customer-1.md). Channels:

1. **Facebook owner-operator groups** — daily value posts + DMs (`marketing/facebook-group-posts.md`).
2. **AZ driving schools** — placement-office partnerships (highest-intent, `marketing/cold-outreach-scripts.md`).
3. **Truck stops / driver lounges** — business cards along the Hwy 400 corridor.
4. **Kijiji + Instagram** — inbound presence (`marketing/kijiji-ad.md`, `marketing/instagram.md`).
5. **Referral program** — every onboarded carrier becomes a channel (`documents/output/Northbound-Referral-Program.pdf`).

---

## 9. Operations

Run on the daily cadence in [`playbook/daily-operations-playbook.md`](../playbook/daily-operations-playbook.md):
morning load search → mid-morning offers/negotiation/confirmations → afternoon monitor/prospect →
evening close-out/invoicing. Everything logged in the **Dispatch Tracker** CRM. Weekly: Friday
invoicing, carrier performance review, recruitment push, insurance-expiry check.

**Guardrails:** dispatch service (never imply we hold freight/authority); verify carrier MC/CVOR
and insurance ($1M liability + cargo) before dispatch; carrier comes first; if it's not in the
tracker, it didn't happen.

---

## 10. Technology & Product

- **Now:** static marketing site, branded PDF document suite, Dispatch Tracker CRM (localStorage).
- **Phase 3B:** Loadlink/DAT load-board integration notes (`docs/load-board-integration.md`).
- **Phase 4:** AI layer — Sarah voice agent, OpenClaw load matching, n8n workflows.
- **Phase 4D — future SaaS:** "AI Dispatch Commander," the autonomous human-gated dispatch agent,
  productized and sold to other small dispatchers/brokerages. The tracker schema is the prototype.

The services business funds and field-tests the product. The product becomes the second revenue line.

---

## 11. Milestones

| Horizon | Target |
|---|---|
| **Week 1 (go-live)** | Site live on production domain, email working, Loadlink active, cards printed, agreement attorney-reviewed |
| **Day 14** | **Customer 1** — first carrier with a confirmed, delivered load that generated a fee |
| **Day 30** | 2–3 active carriers, first weekly invoices sent, repeatable onboarding |
| **Day 60** | 4–5 active carriers, first n8n automation live (insurance-expiry alerts) |
| **Day 90** | **5+ active carriers, $3,000+/month fees, 1 automation live** |
| **Month 6** | 8–10 trucks, onboarding + invoicing automated, Loadlink API matching MVP |
| **Month 12** | 15+ trucks on one operator, Dispatch Commander prototype validated |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Carrier acquisition slower than planned | Multi-channel outreach; schools are highest-intent; referral program compounds |
| Legal/compliance confusion (dispatch vs. broker) | Clear positioning everywhere; attorney-reviewed agreement; verify carrier authority/insurance |
| Loadlink API access delayed | Manual workflow works day 1; API is an efficiency upgrade, not a dependency |
| Operator time bottleneck before automation | Tight playbook + tracker; sequence automations by time-saved (insurance alerts → onboarding first) |
| Rate-market downturn | Fee scales with carrier revenue (8%); flat option de-risks for carriers, stabilizes our recurring revenue |
| Single-operator key-person risk | Document everything (this repo); automation reduces dependence on any single human task |

---

## 13. The Ask / Capital

Effectively bootstrapped. Startup cost is **the first month of tooling (~$150) plus business cards** —
covered by the first carrier's first week of fees. No external capital required to reach Customer 1.
Reinvest early fees into Loadlink API access and the n8n automation layer to lift per-operator truck capacity.

---

*Independent dispatch service for owner-operators — not a freight broker. Barrie, Ontario, Canada.*
