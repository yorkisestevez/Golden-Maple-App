# Road to Customer 1 — Go-to-Market Sprint

> **Goal: land the first paying carrier.** Then prove the loop is repeatable.
> One operator, Barrie ON. Companion to [`business-plan.md`](./business-plan.md) and
> [`playbook/daily-operations-playbook.md`](../playbook/daily-operations-playbook.md).

This is the customer-acquisition roadmap — distinct from the *technical* roadmap in
[`ai-automation-roadmap.md`](./ai-automation-roadmap.md). No automation is required to reach
Customer 1; manual hustle plus the existing site, PDFs, and tracker is enough.

---

## Definition of "Customer 1"

> **Customer 1 = the first carrier with a confirmed, delivered load that generated a dispatch fee.**

Not a signed agreement. Not a "yeah I'm interested." A truck you loaded, that delivered, that
you invoiced. Everything below drives to that one event.

**Leading indicators on the way there:**
- 1 carrier onboarded (agreement acknowledged, profile in the tracker)
- 1 load offered → confirmed → dispatched
- 1 rate confirmation sent
- 1 POD confirmed → 1 invoice sent

---

## Phase 0 — Pre-Flight (Days 0–3): be ready to deliver

You cannot dispatch a carrier you can't legally and operationally serve. Clear this checklist
**before** outreach so the first "yes" doesn't stall.

| # | Item | Done when | Reference |
|---|---|---|---|
| 1 | Website live on production domain | `northbounddispatch.ca` resolves, HTTPS green | [`production-deployment.md`](./production-deployment.md) |
| 2 | Application form delivers to a real inbox | Test submission arrives | `website/index.html` form action |
| 3 | Business email working | `dispatch@northbounddispatch.ca` sends/receives | deployment doc §4 |
| 4 | Phone number ready | A number on the cards/site you'll answer | — |
| 5 | Loadlink subscription active | Can log in and search Ontario loads | `docs/load-board-integration.md` |
| 6 | Carrier–Dispatcher Agreement reviewed | Ontario attorney has signed off | `documents/output/Northbound-Carrier-Dispatcher-Agreement.pdf` |
| 7 | Rate Confirmation + Onboarding Checklist printed/ready | PDFs on hand | `documents/output/` |
| 8 | Business cards printed | Navy/orange cards in hand | `documents/output/Northbound-Business-Card.pdf` |
| 9 | Dispatch Tracker ready | Opens, sample data clears, you know the flow | `dispatch-tracker/` |
| 10 | Marketing assets personalized | Real phone number swapped into all templates | `marketing/` |

> **Gate:** Do not start Phase 1 until items 1–6 and 9 are green. 7, 8, 10 can finish in parallel.

---

## Phase 1 — Outreach Blitz (Days 3–10): fill the top of the funnel

Run this *on top of* the daily operations cadence. **Target: 50+ touches, 10+ real
conversations, 3+ warm leads in the tracker as `prospect`.**

### Daily outreach quota (every weekday)
- **2–3 Facebook group value posts / comments** — use `marketing/facebook-group-posts.md`. Post
  in Ontario owner-operator / trucking groups. Lead with help, not a pitch.
- **5 direct messages** to owner-ops who engage, post "looking for loads," or fit the profile.
- **3 cold touches** from `marketing/cold-outreach-scripts.md` (a school, a truck stop, a dealer).

### One-time, high-leverage moves (do once this week)
- **Call 3 AZ driving schools** (Barrie/GTA) — placement office. Highest-intent channel; new
  grads need a dispatcher in week one. Offer the "How dispatch works" one-pager + referral program.
- **Drop cards at 3–5 truck stops / driver lounges** along the Hwy 400 corridor.
- **Post the Kijiji ad** (`marketing/kijiji-ad.md`) and **set up Instagram** (`marketing/instagram.md`,
  bio + first 5 captions).

### Log everything
Every promising contact → a `prospect` carrier in the tracker with source (`facebook` / `school` /
`truckstop` / `kijiji` / `referral` / `direct`). If it's not in the tracker, it didn't happen.

---

## Phase 2 — Convert (Days 7–14): turn a warm lead into a loaded truck

The moment a prospect says "what do you charge / how does it work," shift from marketing to closing.

### The conversion conversation
1. **Qualify (5 min):** equipment type, home base, preferred lanes, rate minimum/mile, are they
   currently dispatched, MC/CVOR + insurance current?
2. **Pitch the offer:** 8% of gross *or* $200/week flat. No setup fee. Week-to-week — *"if I don't
   perform, you walk. I earn your truck every week."* No lock-in is the close.
3. **Handle the #1 objection** ("I can find my own loads"): "You can — but every hour on the board
   is an hour not driving or resting. I keep the truck loaded at a better rate than you'll get
   negotiating tired. Try me for one week, no commitment."
4. **Onboard on the spot:** walk the Onboarding Checklist, get the Agreement acknowledged, collect
   MC/CVOR + insurance docs, verify insurance ($1M liability + cargo), create the carrier in the
   tracker with their lanes/equipment/rate minimum.

### First load (the actual goal)
5. **Find their first load that morning** — Loadlink, matched to their lane/equipment, scored at/above
   their minimum with reasonable deadhead (playbook Load Scoring).
6. **Offer it** (net rate to them, lane, appointment times) → status `offered`.
7. **Negotiate the broker up**, lock the rate, **send the Rate Confirmation** → status `confirmed`.
   *No truck dispatched without an accepted rate AND a confirmation in hand.*
8. **Dispatch.** Monitor to pickup → `in_transit`, to delivery → `delivered` (confirm POD).

🎉 **That delivered load with a dispatch fee = Customer 1.**

---

## Phase 3 — Bank It & Repeat (Days 14–30): prove repeatability

One customer is luck; the loop is the business.

- **Invoice it** (Friday cadence) — tracker → generate weekly invoice → send → status `sent`.
  First dollar of revenue collected.
- **Over-deliver week 1** — keep that truck loaded; a happy first carrier is your best referral.
- **Trigger the referral program** (`documents/output/Northbound-Referral-Program.pdf`) — ask the
  happy carrier for one intro.
- **Debrief the loop:** which channel produced them? Double down there. What stalled? Fix it.
- **Push to 2–3 active carriers** by Day 30 by re-running Phases 1–2 with the now-proven script.

---

## Weekly targets to Customer 1

| Week | Focus | Target |
|---|---|---|
| **Week 1** | Pre-flight + open the funnel | Go-live checklist green; 50+ touches; 3+ prospects logged |
| **Week 2** | Convert | 1 carrier onboarded; **first load confirmed → delivered (Customer 1)**; first invoice sent |
| **Weeks 3–4** | Repeat | 2–3 active carriers; referral asked; best channel identified |

---

## Metrics dashboard (track daily/weekly in the tracker)

- **Touches** (posts + DMs + cold contacts) — volume in
- **Conversations** — real two-way exchanges
- **Prospects** — logged leads (`prospect`)
- **Onboarded** — carriers with profiles + acknowledged agreement
- **Active** — carriers with a confirmed/delivered load
- **Fees this week** — the KPI that matters (Dashboard "Fees This Week")
- **Channel attribution** — which `source` is producing — to know where to spend the next hour

---

## If you stall (troubleshooting the funnel)

| Symptom | Likely cause | Fix |
|---|---|---|
| Lots of touches, no conversations | Pitching instead of helping | Lead with value; answer questions, don't sell in post #1 |
| Conversations, no onboards | Trust / proof gap | Lean on week-to-week, no lock-in; show the agreement + professional PDFs/site |
| Onboarded, no first load | Rate minimum too high / lane too thin | Re-scope lanes; find any at-minimum load to start the relationship |
| Customer 1 but no #2 | Not asking for referrals; one channel | Trigger referral program; diversify outreach channels |

---

*Land Customer 1. Bank the fee. Ask for the referral. Run the loop again.*
