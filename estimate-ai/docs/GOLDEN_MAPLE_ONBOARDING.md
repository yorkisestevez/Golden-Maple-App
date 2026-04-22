# Golden Maple Onboarding Runbook

> **Goal:** Go from a cold repo to Golden Maple Landscaping running a live EstimateAI estimator on goldenmaplelandscaping.ca in under 30 minutes.

Golden Maple is EstimateAI's customer zero — the pilot used to validate the end-to-end flow (embed form → estimate → lead capture → Resend notification → dashboard) before opening signups to other contractors. The pilot is **managed**: Yorkis monitors leads via email and direct Supabase queries. No dashboard login needed.

---

## Pre-flight checklist

Before you start, make sure you have:

- [ ] **Supabase project access** to `psezdpslixisifzphrhh.supabase.co` (URL pre-filled in `.env.example`)
- [ ] **Supabase anon key** and **service role key** (from dashboard: Settings → API)
- [ ] **Stripe account** — either test keys for dev, or live keys + 3 products created (Standard $97 / Pro $197 / Agency $497)
- [ ] **Stripe webhook secret** for `/api/webhook/stripe` endpoint
- [ ] **Resend API key** — with a verified sending domain (or use the default onboarding domain for testing)
- [ ] **Anthropic API key** — only if Pro-tier AI insights should be live on day one. Skippable for pilot.
- [ ] **Notification email address** for `notification_email` (currently `Yorkis@goldenmaplelandscaping.ca`)
- [ ] **Access to Golden Maple's Netlify site** (goldenmaplelandscaping.ca) to paste the embed snippet
- [ ] **30 minutes** of uninterrupted time

---

## Step 1 — Local environment

```bash
cd C:/Business/projects/estimateai/estimate-ai
cp .env.example .env.local
```

Open `.env.local` in your editor and fill in every blank value. The comments in `.env.example` document where to find each one. Minimum viable set for Golden Maple to accept leads:

- `NEXT_PUBLIC_SUPABASE_URL` (pre-filled)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` (leave as `http://localhost:3000` for step 4)

Stripe and Anthropic keys can stay blank if you're only testing the lead-capture flow. Billing and AI insights will be disabled but everything else works.

Verify the file isn't tracked:

```bash
git status .env.local
# should print: nothing (ignored by .gitignore)
```

---

## Step 2 — Deploy the schema

Three migration files under `supabase/migrations/`:

| File | What it does | Idempotent? |
|---|---|---|
| `001_initial_schema.sql` | Creates all 5 tables + RLS policies | Yes (CREATE TABLE IF NOT EXISTS pattern OR first-run only) |
| `002_professional_cloud_defaults.sql` | Updates contractor color/font defaults | Yes (ALTER DEFAULT is a no-op if already set) |
| `003_golden_maple_seed.sql` | Inserts Golden Maple contractor + 10 services + pricing | Yes (ON CONFLICT DO NOTHING on all rows) |

**Before running 003**, edit the file and replace:

- `REPLACE_WITH_CONTRACTOR_EMAIL` → a real inbox you control (currently `Yorkis@goldenmaplelandscaping.ca`)
- `REPLACE_WITH_NOTIFICATION_EMAIL` → who should receive lead notifications (currently `Yorkis@goldenmaplelandscaping.ca`)

### Option A — Supabase SQL Editor (easiest, 3 minutes)

1. Open https://supabase.com/dashboard/project/psezdpslixisifzphrhh/sql/new
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`, click **Run**
   - If it errors with "relation contractors already exists", 001 is already deployed — skip to step 3.
3. Paste `supabase/migrations/002_professional_cloud_defaults.sql`, click **Run**
4. Paste `supabase/migrations/003_golden_maple_seed.sql` (with your email edits), click **Run**
5. Verify using the queries at the bottom of each migration file.

### Option B — Supabase CLI (automated)

```bash
# Install Supabase CLI if you don't have it
npm install -g supabase

# Log in and link to the project
supabase login
supabase link --project-ref psezdpslixisifzphrhh

# Push all pending migrations
supabase db push
```

### Verify the seed landed

Run this in the SQL Editor:

```sql
SELECT slug, company_name, plan_status, notification_email
FROM contractors
WHERE slug = 'golden-maple';
-- Expect: 1 row, plan_status = 'trialing'

SELECT count(*) FROM services
WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001';
-- Expect: 10

SELECT currency, hst_rate FROM pricing_config
WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001';
-- Expect: CAD, 0.13
```

---

## Step 3 — Tune Golden Maple's pricing (optional for pilot, required before production)

The seed uses the same baseline cost ranges as `lib/seed-data.ts` — a generic Ontario outdoor-living model. Before sending real estimates to homeowners, either:

**Quick path (pilot):** Accept the baseline for the first 2–3 real leads. See if estimates look roughly right. Refine based on feedback.

**Thorough path (production):** Edit `supabase/migrations/003_golden_maple_seed.sql` or run UPDATE statements directly against the `services` table. For each service, adjust:

- `mat_cost_{good,better,best}_{low,high}` — material cost per unit
- `prod_rate_{good,better,best}_{low,high}` — productivity (units per crew-day)
- `days_{good,better,best}_{low,high}` — fixed-duration projects (outdoor kitchen, firepit, pergola, lighting)

Also check `pricing_config`:

- `crew_rate_per_day` (currently $3000 CAD)
- `tier_best_multiplier` (currently 1.35 — adjust if you want a different premium bump)
- `minimum_estimate` (currently $5000 — raise if you don't take small jobs)

Once updated, re-run the UPDATE statements in the SQL Editor.

---

## Step 4 — Local smoke test

```bash
cd C:/Business/projects/estimateai/estimate-ai
npm install     # if you haven't already
npm run dev
```

Then open: **http://localhost:3000/embed/golden-maple**

What to verify:

1. **Page renders** — no 404 (if you see 404, the contractor row is missing or `plan_status` is not `'trialing'`/`'active'`)
2. **Brand colors** — forest green accents (#2F7D32), Inter font, Professional Cloud layout
3. **Services list populates** — you should see 10 services: Patio, Retaining Wall, Steps, Driveway, Walkway, Outdoor Kitchen, Fire Pit, Pergola, Landscape Lighting, Garden Bed
4. **Estimate calculates** — pick a service, adjust sliders, see a dollar range appear
5. **Submit a test lead** — fill in name + phone, click submit
6. **Lead appears in Supabase** — run in SQL Editor:
   ```sql
   SELECT id, name, phone, estimate_mid, created_at
   FROM leads
   WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001'
   ORDER BY created_at DESC
   LIMIT 5;
   ```
7. **Resend email arrives** — check the inbox you set as `notification_email`. Should land within 10 seconds.

If any of steps 1–7 fail, see the **Troubleshooting** appendix below.

---

## Step 5 — Deploy to Netlify

Once the local smoke test passes end-to-end:

1. **Set environment variables in Netlify dashboard**
   - Netlify site → Site configuration → Environment variables
   - Add every non-empty variable from your `.env.local`, one by one
   - Treat `.env.example` as your checklist — do not skip `SUPABASE_SERVICE_ROLE_KEY`
   - Update `NEXT_PUBLIC_APP_URL` to the real production URL (e.g., `https://estimateai.netlify.app` or the custom domain)

2. **Deploy**
   ```bash
   cd C:/Business/projects/estimateai/estimate-ai
   netlify deploy --build --prod
   ```
   (Or push to the branch Netlify is watching and let CI deploy.)

3. **Verify the live URL**
   - Open `https://<your-netlify-url>/embed/golden-maple`
   - Repeat the 7 verification steps from Step 4 against the production URL
   - Submit one real test estimate — confirm lead lands in production Supabase

4. **Update `NEXT_PUBLIC_APP_URL`** if you didn't in step 1, then redeploy.

---

## Step 6 — Embed on goldenmaplelandscaping.ca (Netlify)

Paste the iframe snippet into the Golden Maple Netlify site (Services page, or a new `/get-estimate` page).

### iframe embed (recommended)

```html
<iframe
  src="https://<your-estimateai-netlify-url>/embed/golden-maple"
  style="width:100%; border:0; min-height:900px; display:block;"
  title="Get an instant project estimate"
  loading="lazy">
</iframe>
```

**Why iframe:** isolated CSS, no JS conflicts, auto-resizes via the `postMessage` listener baked into `app/embed/[slug]/page.tsx`. Works on every hosting platform.

### Where to place it

Recommended locations, in order of impact:

1. **Dedicated page** — create `/get-an-estimate`, paste the iframe as the only content. Add a banner link from the homepage. Best conversion.
2. **Services page, above the fold** — right under the hero headline. Second-best.
3. **Homepage hero CTA** — button that scrolls to an iframe embedded lower on the page. OK for low-traffic sites.

Avoid: sidebars, popups, or anything that requires hover to reveal. The estimator is a primary conversion surface.

---

## Step 7 — End-to-end verification from the public internet

Once the Netlify site is live with the embed:

1. **Open goldenmaplelandscaping.ca on your phone** (not localhost — the actual production page)
2. **Submit a real-feeling estimate**
   - Realistic name / phone / notes
   - A combination you'd actually build (e.g., 400 sqft patio + firepit)
   - Select "Better" tier, "Moderate" site condition
3. **Verify the email arrives** to `notification_email` within 10 seconds
4. **Verify the lead row** in Supabase (same SQL as Step 4 bullet 6)
5. **Measure**: time from Submit to Email = should be under 5 seconds
6. **Delete the test lead** when done:
   ```sql
   DELETE FROM leads
   WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001'
     AND name = '<the_test_name>';
   ```

If all 5 pass, Golden Maple is live.

---

## Step 8 — Go live

Once the embed is verified on production, monitor:

- Resend dashboard for delivery/open rates
- Supabase `leads` table for row count over time
- `usage_logs` table for `event_type = 'lead_submit'` with timestamps

First weekend benchmark to beat: **1 real lead.** That's the bar for "it's working."

---

## Troubleshooting

### 404 on `/embed/golden-maple`

**Cause:** The embed page query at `app/embed/[slug]/page.tsx` is:

```ts
.eq('slug', slug)
.in('plan_status', ['active', 'trialing'])
.single()
```

If the row is missing OR `plan_status` is something else, `contractor` is `null` → `notFound()` fires.

**Fix:**
```sql
SELECT slug, plan_status FROM contractors WHERE slug = 'golden-maple';
-- If missing: re-run 003 migration
-- If plan_status wrong:
UPDATE contractors SET plan_status = 'trialing'
WHERE slug = 'golden-maple';
```

### Page loads but says "Estimator not configured"

**Cause:** Either `services` returned empty (RLS blocking or `is_active = false`) or `pricing_config` is missing.

**Fix:**
```sql
-- Check services
SELECT count(*), bool_and(is_active) FROM services
WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001';
-- Expect: count >= 1, bool_and = true

-- Check pricing_config
SELECT * FROM pricing_config
WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001';
-- Expect: 1 row
```

If services or pricing are missing, re-run the relevant sections of 003.

### Form submits but no email arrives

Walk down this checklist in order:

1. **`RESEND_API_KEY` set and valid?** — check Netlify env vars (or `.env.local` if testing local)
2. **`notification_email` column populated?** —
   ```sql
   SELECT notification_email, email FROM contractors
   WHERE slug = 'golden-maple';
   ```
   Fallback chain in `/api/webhook/lead/route.ts` is `notification_email ?? email`. Both must be non-null and valid.
3. **Resend sending domain verified?** — check https://resend.com/domains. Unverified domains silently drop emails to real addresses.
4. **Check Resend logs** — https://resend.com/logs shows every send attempt with success/failure.
5. **Check the Next.js server logs** — `/api/webhook/lead` catches email errors and logs them but doesn't fail the request, so a successful lead insert can still have a broken email path.

### Estimate calculation looks wrong

**Cause:** `pricing_config` multipliers are off, or service `mat_cost_*` / `prod_rate_*` ranges are unrealistic.

**Fix:** Pull down the actual breakdown via the SQL Editor:

```sql
SELECT selected_features, tier, site_condition,
       estimate_low, estimate_mid, estimate_high, breakdown
FROM leads
ORDER BY created_at DESC LIMIT 1;
```

Inspect the `breakdown` JSONB — it has the full per-service calculation trail. Compare to what you'd expect. Usually the fix is tuning `crew_rate_per_day` or a specific service's cost range (Step 3 above).

### AI insight never appears

**Cause:** AI insights are Pro/Agency only. Check:

```sql
SELECT plan, ai_insights_enabled FROM contractors
WHERE slug = 'golden-maple';
-- Expect: plan = 'pro' (or agency), ai_insights_enabled = true
```

Also verify `ANTHROPIC_API_KEY` is set in env and the rate limit (50/day for Pro) hasn't been hit:

```sql
SELECT count(*) FROM usage_logs
WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001'
  AND event_type = 'ai_insight'
  AND created_at > NOW() - INTERVAL '1 day';
```

---

## Rollback — remove Golden Maple entirely

If you need to start fresh:

```sql
DELETE FROM contractors WHERE id = 'a0000000-0000-0000-0000-000000000001';
```

Thanks to `ON DELETE CASCADE` on the foreign keys, this also wipes:
- All rows in `services` for this contractor
- The row in `pricing_config`
- All captured leads
- All `usage_logs` entries

Then re-run `003_golden_maple_seed.sql` (with your edits) and you're back to a clean state.

---

## Appendix: What's different from `/api/seed`

The `/api/seed` route (`app/api/seed/route.ts`) is the signup-flow bootstrap for NEW contractors. It takes a `contractor_id` and inserts the same 10 services + pricing config from `lib/seed-data.ts`.

`003_golden_maple_seed.sql` mirrors those exact values verbatim, plus:
- Creates the contractor row itself (the API assumes the contractor row already exists, created by the signup flow)
- Uses a deterministic UUID so the SQL is idempotent and the `/embed/golden-maple` URL is stable
- Overrides the brand defaults from 002 with Golden Maple's actual green palette
- Sets `plan = 'pro'` and `ai_insights_enabled = true` for the pilot (free Pro tier during trial)

If you edit `lib/seed-data.ts` to change the default service list, you should also update 003 — or delete the Golden Maple contractor and re-run `/api/seed` against the fixed UUID to regenerate from the new source of truth.

---

## Appendix: Why Golden Maple has no auth.users row

The contractors table has RLS policies `contractors_own_data FOR ALL USING (auth.uid() = id)` — meaning a contractor authenticated via Supabase Auth can read/write their own row if and only if `auth.uid()` equals the contractor row ID. For this to work for a logged-in user, a matching `auth.users` row must exist.

**For Golden Maple's pilot**, we're skipping auth entirely:
- Homeowners use the public embed form (`plan_status IN ('active','trialing')` RLS policy allows anon reads of brand/services/pricing and anon INSERTs of leads)
- Yorkis monitors leads via:
  - Resend email notifications (pushed)
  - Direct Supabase queries via the service_role key (pulled)
- No one logs into the EstimateAI dashboard for this pilot

If dashboard access is ever needed:
1. Create an auth.users row via Supabase Auth (Invite User → email magic link)
2. Copy the new `auth.users.id` UUID
3. Either UPDATE the existing contractor row's `id` to match (breaks FK references — don't do this) OR create a second contractor row keyed to the new auth ID and migrate services/pricing/leads across

Simpler: leave Golden Maple as managed and create a separate contractor record if self-serve access is ever needed.

---

*Last updated: 2026-04-12. Cleaned up hallucinated "Adam" and "Duda" references from original generation. When you change the onboarding flow, update this file or it will rot.*
