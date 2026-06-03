# Load Board Integration Notes (Phase 3B)

Initially **manual** — Yorkis logs in and searches each board. This document records the API / automation paths so the OpenClaw load-matching agent (Phase 4B) can take over board scanning later.

> Status legend: 🟢 in use manually · 🟡 API available, not yet integrated · 🔴 future

---

## Loadlink — loadlink.ca 🟢🟡
- **What:** Primary Canadian freight board. Best coverage for Ontario domestic + cross-border.
- **Use now:** Manual search every morning (see Operations Playbook). Basic subscription ~$100–$150/month.
- **API:** Loadlink has an API program — **requires application/approval**. This is the first integration target for OpenClaw load matching.
- **Action:** Apply for API access once 5+ carriers are active and the manual workflow is proven.

## DAT One — dat.com 🟡
- **What:** Largest North American board. Critical for US-bound and cross-border lanes.
- **API:** DAT API available (paid tier). Rich rate/lane data (DAT RateView) useful for negotiation benchmarks.
- **Action:** Add when cross-border volume justifies the cost. RateView data feeds load scoring.

## Truckstop — truckstop.com 🔴
- **What:** Second-largest board. API available.
- **Action:** Evaluate later; redundant with Loadlink + DAT at small scale.

## Direct shipper outreach 🟢
- **What:** Highest-margin freight, no board fees. LinkedIn, local manufacturer directories, cold-calling logistics managers.
- **Action:** Ongoing. Log direct relationships in the tracker with `source = direct`.

---

## Integration sequence (when automating)
1. **Loadlink API** → pull available loads → normalize to the tracker's Loads schema.
2. **Match** against active carriers (`equipment_type`, `preferred_lanes`, `rate_minimum_per_mile`).
3. **Score** each match: `rate_per_mile` vs. minimum, deadhead distance, delivery timeline.
4. **Push** top matches to Yorkis via Telegram for approval (human-in-the-loop).
5. **Add DAT** for cross-border + rate benchmarking.

## Tracker schema mapping (target)
| Board field | Tracker `loads` field |
|-------------|----------------------|
| Origin city/prov | `pickup_location` |
| Destination city/prov | `delivery_location` |
| Pickup date | `pickup_date` |
| Equipment | `equipment_required` |
| Posted rate | `gross_rate` |
| Miles | `loaded_miles` |
| Broker / company | `broker_name` |
| Board | `source` (`loadlink` / `dat` / ...) |

Dispatch fee + net-to-carrier are computed by the tracker, not the board.
