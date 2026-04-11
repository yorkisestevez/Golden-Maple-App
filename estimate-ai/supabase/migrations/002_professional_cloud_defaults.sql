-- ============================================================================
-- Migration 002: Professional Cloud brand defaults for contractors
-- ============================================================================
-- The original 001 schema hardcoded SynkOps-era color and font defaults into
-- the contractors table (#D4AF63 gold, #6B1E2E burgundy, #0F0E0A near-black
-- background, Cormorant Garamond / Jost fonts). After the TradeFlow AI /
-- Professional Cloud rebrand, any NEW contractor spawning via signup or the
-- /api/seed route still inherits the dark+gold palette.
--
-- This migration updates the column DEFAULTS to Professional Cloud values.
--
-- Safety properties:
--   * Does NOT touch existing rows. Only affects future INSERTs that omit
--     these columns. Existing contractors keep whatever values they have.
--   * Idempotent. Re-running the same ALTER DEFAULT is a no-op in Postgres.
--   * Reversible. To roll back, re-run with the original SynkOps values.
--
-- Palette reference (must match app/globals.css and app/page.tsx):
--   primary    #2563EB  blue-600      — main accent, CTAs, brand
--   secondary  #1D4ED8  blue-700      — hover state, darker accent
--   background #F9FAFB  slate-50      — page background
--   card       #FFFFFF  white         — card surface
--   text       #111827  slate-900     — primary text
--   font       Inter                  — both headline and body
-- ============================================================================

ALTER TABLE contractors
  ALTER COLUMN primary_color    SET DEFAULT '#2563EB',
  ALTER COLUMN secondary_color  SET DEFAULT '#1D4ED8',
  ALTER COLUMN background_color SET DEFAULT '#F9FAFB',
  ALTER COLUMN card_color       SET DEFAULT '#FFFFFF',
  ALTER COLUMN text_color       SET DEFAULT '#111827',
  ALTER COLUMN headline_font    SET DEFAULT 'Inter',
  ALTER COLUMN body_font        SET DEFAULT 'Inter';

-- Verification query (run manually after migration):
--   SELECT column_name, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'contractors'
--     AND column_name IN ('primary_color','secondary_color','background_color',
--                         'card_color','text_color','headline_font','body_font');
