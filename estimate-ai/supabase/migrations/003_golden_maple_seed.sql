-- ============================================================================
-- Migration 003: Seed Golden Maple as contractor zero
-- ============================================================================
-- Creates Golden Maple Landscaping as the first real EstimateAI customer.
-- This is the pilot / customer-zero used to validate the end-to-end flow
-- (embed form → estimate → lead capture → Resend notification) before
-- opening up signups to other contractors.
--
-- ──────────────────────────────────────────────────────────────────────────
-- BEFORE RUNNING — edit these placeholder values
-- ──────────────────────────────────────────────────────────────────────────
--   1. REPLACE_WITH_NOTIFICATION_EMAIL
--      Email that receives lead notifications via Resend. Usually Adam
--      (Golden Maple owner) or yorkis@openclaw.local during testing.
--
--   2. REPLACE_WITH_CONTRACTOR_EMAIL
--      Primary contact email stored on the contractor row. NOT NULL, unique.
--      Use a real inbox you control (fallback for notifications).
--
--   3. Service cost ranges (mat_cost_*, prod_rate_*)
--      These are mirrored from lib/seed-data.ts DEFAULT_SERVICES — the same
--      values /api/seed inserts for any new contractor. They are a generic
--      Ontario outdoor-living baseline. Tune them to Adam's real price book
--      before Golden Maple goes live, OR accept the baseline for the pilot
--      and refine after the first 2-3 real leads come in.
--
-- ──────────────────────────────────────────────────────────────────────────
-- Design decisions (see docs/GOLDEN_MAPLE_ONBOARDING.md for rationale)
-- ──────────────────────────────────────────────────────────────────────────
--   * Fixed UUID a0000000-0000-0000-0000-000000000001 so the embed slug URL
--     /embed/golden-maple can be reasoned about and the SQL is deterministic.
--   * plan_status = 'trialing' so the embed form RLS policies allow public
--     reads of brand/services/pricing and public INSERTs of leads.
--   * trial_ends_at = NOW() + 1 year — generous pilot runway.
--   * No auth.users row — Golden Maple is a MANAGED customer for the pilot.
--     Yorkis watches their leads via Resend email + direct Supabase queries.
--     They do not log into the dashboard themselves (no password flow).
--   * Brand colors use Golden Maple's actual green palette (#2F7D32 forest
--     green) rather than the Professional Cloud blue default from 002,
--     because Golden Maple's brand is green-forward. Neutrals stay on
--     Professional Cloud tokens for contrast and legibility.
--   * All service values mirror lib/seed-data.ts DEFAULT_SERVICES verbatim,
--     so this path and the /api/seed route stay in sync. If you edit
--     seed-data.ts, re-apply those changes here (or delete this row and
--     re-run /api/seed with the fixed UUID).
--   * Pricing config mirrors lib/seed-data.ts DEFAULT_PRICING_CONFIG verbatim.
--   * All INSERTs use ON CONFLICT DO NOTHING — safe to re-run without
--     duplicating rows or clobbering manual edits.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Contractor row
-- ----------------------------------------------------------------------------
INSERT INTO contractors (
  id,
  email,
  company_name,
  slug,
  phone,
  website,
  primary_color,
  secondary_color,
  background_color,
  card_color,
  text_color,
  headline_font,
  body_font,
  plan,
  plan_status,
  trial_ends_at,
  notification_email,
  ai_insights_enabled
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'REPLACE_WITH_CONTRACTOR_EMAIL',                -- TODO: real inbox
  'Golden Maple Landscaping',
  'golden-maple',
  NULL,                                            -- TODO: phone if desired
  'https://goldenmaplelandscaping.ca',
  '#2F7D32',                                       -- forest green primary
  '#1B5E20',                                       -- darker green secondary
  '#F9FAFB',                                       -- Professional Cloud bg
  '#FFFFFF',                                       -- white cards
  '#111827',                                       -- slate-900 text
  'Inter',
  'Inter',
  'pro',                                           -- full feature tier for pilot
  'trialing',
  NOW() + INTERVAL '1 year',
  'REPLACE_WITH_NOTIFICATION_EMAIL',              -- TODO: Adam or Yorkis
  TRUE                                             -- AI insights on (Pro feature)
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Services (mirrors lib/seed-data.ts DEFAULT_SERVICES verbatim)
-- ----------------------------------------------------------------------------
-- Inserted in display_order: patio, retaining_wall, steps, driveway, walkway,
-- outdoor_kitchen, firepit, pergola, lighting, garden_bed.

INSERT INTO services (
  contractor_id, key, label, unit, is_slider, slider_min, slider_max, slider_step,
  default_qty, display_order, is_active,
  prod_rate_good_low, prod_rate_good_high,
  prod_rate_better_low, prod_rate_better_high,
  prod_rate_best_low, prod_rate_best_high,
  days_good_low, days_good_high,
  days_better_low, days_better_high,
  days_best_low, days_best_high,
  mat_cost_good_low, mat_cost_good_high,
  mat_cost_better_low, mat_cost_better_high,
  mat_cost_best_low, mat_cost_best_high
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'patio', 'Patio / Interlock', 'sq ft',
   TRUE, 100, 2000, 25, 400, 0, TRUE,
   150, 200, 120, 160, 80, 120,
   NULL, NULL, NULL, NULL, NULL, NULL,
   8, 10, 12, 16, 18, 25),

  ('a0000000-0000-0000-0000-000000000001', 'retaining_wall', 'Retaining Wall', 'lin ft',
   TRUE, 10, 200, 5, 40, 1, TRUE,
   20, 30, 15, 22, 10, 15,
   NULL, NULL, NULL, NULL, NULL, NULL,
   30, 45, 50, 70, 75, 100),

  ('a0000000-0000-0000-0000-000000000001', 'steps', 'Steps / Stairs', 'steps',
   TRUE, 2, 20, 1, 4, 2, TRUE,
   4, 6, 3, 4, 2, 3,
   NULL, NULL, NULL, NULL, NULL, NULL,
   150, 200, 250, 350, 400, 550),

  ('a0000000-0000-0000-0000-000000000001', 'driveway', 'Driveway', 'sq ft',
   TRUE, 200, 1500, 25, 600, 3, TRUE,
   150, 200, 120, 160, 80, 120,
   NULL, NULL, NULL, NULL, NULL, NULL,
   8, 10, 12, 16, 18, 25),

  ('a0000000-0000-0000-0000-000000000001', 'walkway', 'Walkway / Path', 'sq ft',
   TRUE, 50, 600, 10, 150, 4, TRUE,
   100, 150, 80, 120, 60, 90,
   NULL, NULL, NULL, NULL, NULL, NULL,
   8, 10, 12, 16, 18, 25),

  ('a0000000-0000-0000-0000-000000000001', 'outdoor_kitchen', 'Outdoor Kitchen', 'project',
   FALSE, 1, 1, 1, 1, 5, TRUE,
   NULL, NULL, NULL, NULL, NULL, NULL,
   3, 4, 4, 6, 6, 8,
   5000, 7000, 8000, 12000, 15000, 22000),

  ('a0000000-0000-0000-0000-000000000001', 'firepit', 'Fire Pit / Fireplace', 'project',
   FALSE, 1, 1, 1, 1, 6, TRUE,
   NULL, NULL, NULL, NULL, NULL, NULL,
   1, 1.5, 1.5, 2, 2, 3,
   1500, 2500, 3000, 4500, 5000, 8000),

  ('a0000000-0000-0000-0000-000000000001', 'pergola', 'Pergola / Shade Structure', 'project',
   FALSE, 1, 1, 1, 1, 7, TRUE,
   NULL, NULL, NULL, NULL, NULL, NULL,
   2, 3, 3, 4, 4, 6,
   3000, 5000, 6000, 9000, 10000, 15000),

  ('a0000000-0000-0000-0000-000000000001', 'lighting', 'Landscape Lighting', 'project',
   FALSE, 1, 1, 1, 1, 8, TRUE,
   NULL, NULL, NULL, NULL, NULL, NULL,
   0.5, 1, 1, 1.5, 1.5, 2,
   1000, 2000, 2500, 4000, 4500, 7000),

  ('a0000000-0000-0000-0000-000000000001', 'garden_bed', 'Garden Bed / Planting', 'sq ft',
   TRUE, 50, 1000, 25, 200, 9, TRUE,
   200, 300, 150, 200, 100, 150,
   NULL, NULL, NULL, NULL, NULL, NULL,
   5, 8, 10, 15, 16, 22)
ON CONFLICT (contractor_id, key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Pricing config (mirrors lib/seed-data.ts DEFAULT_PRICING_CONFIG verbatim)
-- ----------------------------------------------------------------------------
INSERT INTO pricing_config (
  contractor_id,
  crew_rate_per_day,
  crew_multiplier,
  tier_good_multiplier,
  tier_better_multiplier,
  tier_best_multiplier,
  tier_good_label,
  tier_good_desc,
  tier_better_label,
  tier_better_desc,
  tier_best_label,
  tier_best_desc,
  site_standard_add_days,
  site_moderate_add_days,
  site_complex_add_days,
  rounding_increment,
  minimum_estimate,
  show_hst,
  hst_rate,
  currency
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  3000,
  1.25,
  1.0,
  1.15,
  1.35,
  'Good',
  'Standard materials, clean & functional.',
  'Better',
  'Upgraded materials, more design complexity.',
  'Best',
  'Premium materials, complex design, full vision.',
  0,
  0.5,
  1,
  500,
  5000,
  TRUE,
  0.13,
  'CAD'
)
ON CONFLICT (contractor_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Rollback (if needed — run manually, NOT part of this migration)
-- ----------------------------------------------------------------------------
-- DELETE FROM contractors WHERE id = 'a0000000-0000-0000-0000-000000000001';
-- (services, pricing_config, leads, usage_logs cascade via FK ON DELETE CASCADE)

-- ----------------------------------------------------------------------------
-- Verification queries (run manually after migration)
-- ----------------------------------------------------------------------------
-- SELECT id, slug, company_name, plan_status, notification_email
-- FROM contractors WHERE slug = 'golden-maple';
--
-- SELECT key, label, unit, display_order FROM services
-- WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001'
-- ORDER BY display_order;
--
-- SELECT currency, hst_rate, minimum_estimate FROM pricing_config
-- WHERE contractor_id = 'a0000000-0000-0000-0000-000000000001';
