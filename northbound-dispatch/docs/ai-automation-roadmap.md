# AI Automation Layer — Roadmap (Phase 4)

Document now, build iteratively. The AI layer is the moat — every month it should take more of the Daily Operations Playbook off the human's plate. Built on the shared stack with Golden Maple (voice agent, n8n) and OpenClaw.

---

## 4A — "Sarah" Voice Agent Clone for Dispatch
Clone Sarah's architecture (**ElevenLabs + Telnyx SIP**) for a dispatch-specific inbound line.

**Handles:**
- "Any loads today?" → reads available/offered loads matched to the caller's carrier profile.
- "I'm available tomorrow from Barrie." → logs availability + home location to the tracker.
- "What's the rate on load #X?" → looks up the load and reads gross/net.

**Logs** availability updates directly to the CRM/tracker.
**Escalates** complex requests to Yorkis via Telegram.

**Dependencies:** Telnyx number (~$5/mo, already in the budget), ElevenLabs voice, tracker read/write API (today the tracker is localStorage-only — needs a thin backend or shared store before the agent can write to it).

---

## 4B — OpenClaw Load-Matching Agent
- Monitors **Loadlink/DAT APIs** (once access is secured — see `load-board-integration.md`).
- Matches available loads to carrier profiles: `equipment_type`, `preferred_lanes`, `rate_minimum_per_mile`.
- **Scores** each match:
  - `rate_per_mile` vs. carrier minimum
  - deadhead distance
  - delivery timeline feasibility
- Pushes **top matches to Yorkis via Telegram** for approval.
- On approval, **auto-sends the rate confirmation** to the carrier.

This is the MVP that proves OpenClaw in the freight domain — target it as the first "at least 1 automation live" success metric (insurance-expiry alerts is the simpler alternative).

---

## 4C — n8n Automation Workflows

| Workflow | Trigger | Steps |
|----------|---------|-------|
| **Carrier onboarding** | New website form submission | Create carrier record → send welcome email + Agreement PDF → set follow-up reminder |
| **Insurance expiry alerts** | Daily cron | Check `insurance_expiry` → 30-day warning email to carrier + Telegram alert to Yorkis |
| **Weekly invoice generation** | Friday cron | Pull delivered loads per carrier this week → generate invoice → email to carrier |
| **Load status updates** | Carrier texts "delivered" | Update load status → trigger broker notification |

**Quick win:** The website form already POSTs to email (FormSubmit). Swapping that endpoint for an n8n webhook unlocks the onboarding flow with no website changes.

---

## 4D — OpenClaw Dispatch Commander (Future SaaS Product)
The full autonomous dispatch agent — the "Foreman for freight":
- Reads carrier availability from the CRM.
- Searches load boards via API.
- Matches, scores, and ranks opportunities.
- Drafts load offers to carriers.
- Handles rate negotiation within pre-set parameters.
- Manages the full lifecycle with human-in-the-loop approval gates.

**Productization:** This becomes *"AI Dispatch Commander — plug it into your brokerage,"* sold to other small dispatchers/brokerages. The tracker data model in this repo is the prototype schema.

---

## Build sequence (recommended)
1. **n8n: insurance-expiry alerts** (easiest, hits the 90-day "1 automation live" metric).
2. **n8n: onboarding flow** (point the website form webhook at n8n).
3. **Backend for the tracker** (so agents can read/write) — small API + DB; reuse Golden Maple patterns/Supabase.
4. **OpenClaw load matching MVP** (Loadlink API → score → Telegram approval).
5. **Sarah voice line** for inbound availability + load questions.
6. **n8n: weekly invoicing + load status updates.**
7. **Dispatch Commander** — compose the above into the autonomous, human-gated product.
