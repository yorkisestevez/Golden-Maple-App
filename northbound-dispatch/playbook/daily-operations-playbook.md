# Northbound Dispatch — Daily Operations Playbook

> **Your loads. Found. Confirmed. Done.**
> Print this. Reference it daily. The AI layer does the grinding — this playbook keeps the human loop tight until the automations take over.

**Owner/Operator:** Yorkis Estevez · Barrie, ON
**Tools:** Dispatch Tracker (CRM) · Loadlink · DAT One · Telegram · Phone/Text
**Target:** 5+ active carriers dispatched weekly · $3,000+/month in fees

---

## Daily Rhythm at a Glance

| Block | Time | Focus |
|-------|------|-------|
| Morning | 6:00–7:00 AM | Availability + load search |
| Mid-Morning | 7:00–10:00 AM | Offers, negotiation, confirmations |
| Afternoon | 12:00–3:00 PM | Monitor, follow-up, prospect |
| Evening | 5:00–6:00 PM | Close-out, pre-plan, invoicing |

---

## 🌅 Morning — Set the Board (6:00–7:00 AM)

1. **Check carrier availability messages** — text, call, email, and the dispatch line (Sarah voice agent, once live). Note which trucks are empty and where.
2. **Log into Loadlink + DAT One.** Open both boards.
3. **Search loads** matching active carriers' lanes and equipment.
   - Filter by equipment type (dry van / flatbed / reefer / step deck).
   - Filter by origin near each carrier's current/home location to cut deadhead.
4. **Score loads** by rate-per-mile vs. each carrier's minimum (`rate_minimum_per_mile` in the tracker).
   - Green: at/above minimum, low deadhead.
   - Yellow: near minimum or moderate deadhead — negotiate up.
   - Red: below minimum — skip unless it's a strategic repositioning move.
5. **Flag the top 5–10 loads** for immediate action. Note Load ID, broker, rate, lane.

> **Update the tracker:** Add the best prospects to the **Loads** table with status `available`. Assign a likely carrier if there's an obvious fit.

---

## ☎️ Mid-Morning — Work the Phones (7:00–10:00 AM)

6. **Call/text carriers with load offers.** Lead with the net rate to them, the lane, and the appointment times. Move the load to status `offered` in the tracker.
7. **Negotiate rates with brokers** for loads carriers want. Anchor high, justify with lane/market, lock the best number.
8. **Send rate confirmations to carriers** using the Rate Confirmation template (PDF). Don't dispatch a truck without a signed/acknowledged confirmation.
9. **Update the tracker** with assignments: set `assigned_carrier_id`, gross rate, dispatch fee (auto-calc @ default %), and move status to `confirmed`.

> **Rule:** No confirmed load without (a) a rate the carrier accepted, and (b) a rate confirmation in hand. Protect the carrier and protect the fee.

---

## 🚚 Afternoon — Keep It Moving (12:00–3:00 PM)

10. **Monitor in-transit loads** for issues — delays, detention, breakdowns. Move loads to `in_transit` once picked up; flag `issue` if anything goes sideways.
11. **Follow up on deliveries.** Confirm PODs. Move delivered loads to `delivered` (this auto-stamps the carrier's `last_load_date`).
12. **Search afternoon / next-day postings.** Backhaul and reload opportunities so trucks don't sit empty.
13. **Prospect for new carriers** — Facebook groups, referrals, replies to your posts. Log promising leads as `prospect` carriers in the tracker.

---

## 🌙 Evening — Close & Pre-Plan (5:00–6:00 PM)

14. **End-of-day status check** on all active loads. Everything should be `confirmed`, `in_transit`, or `delivered` — chase anything still `offered`.
15. **Pre-plan tomorrow's available trucks.** Which trucks deliver tonight/tomorrow and where? Start lining up reloads.
16. **Update CRM notes** — carrier quirks, broker contacts, rate intel. Tomorrow-you will thank today-you.
17. **Send any pending invoices** that are due.

---

## 🗓️ Weekly Cadence

- **Friday — Invoice all carriers.** In the tracker: **Invoices → Generate Weekly Invoices** for the period. Review, send, set status to `sent`. Terms: due within 7 days.
- **Review carrier performance** — loads completed, issues, deadhead ratio. Use the **Carrier Utilization** dashboard view.
- **Carrier recruitment push** — post in 2–3 Facebook groups, reach out to 5 new prospects (see `marketing/` templates).
- **Review revenue vs. target** — Dashboard "Fees This Week" KPI. Are we tracking to $3,000+/month?
- **Check insurance expiries** — Dashboard "Insurance Expiries" view flags anything within 30 days. Chase renewals before they lapse.

---

## Load Scoring Cheat Sheet

```
rate_per_mile          = gross_rate / loaded_miles
effective_rate_per_mi  = gross_rate / (loaded_miles + deadhead_miles)
net_to_carrier         = gross_rate - dispatch_fee
dispatch_fee (8%)      = gross_rate * 0.08
```

**Take the load when:** `effective_rate_per_mi >= carrier minimum` AND delivery timeline is realistic AND deadhead is reasonable for the lane.

**Push back / negotiate when:** rate is within ~10% of minimum, or deadhead eats the margin.

**Walk when:** below minimum with no strategic reason, sketchy broker, or impossible appointment window.

---

## Guardrails (read every week)

- **We are a dispatch service, not a broker.** Never imply Northbound holds freight, holds authority, or guarantees loads.
- **The carrier comes first.** We negotiate for the truck, not the broker.
- **Verify before you dispatch:** carrier MC/CVOR valid, insurance current (min $1M liability + cargo).
- **Everything in CAD** unless a cross-border load is explicitly quoted in USD.
- **Log it in the tracker.** If it's not in the system, it didn't happen.

---

## Escalation & Future Automation Hooks

- Complex carrier requests → escalate to Yorkis via Telegram (Sarah voice agent will route these automatically once live).
- Insurance expiry inside 30 days → tracker flags it now; n8n will email the carrier + ping Telegram (Phase 4C).
- Load matching → manual scoring today; OpenClaw load-matching agent will rank and pre-draft offers (Phase 4B).

*Build it fast, build it right, and let the AI layer take more of this list every month.*
