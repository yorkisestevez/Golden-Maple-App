-- DeckCraft Pro integration: decking estimator settings and lead type support

-- Per-contractor decking estimator settings
CREATE TABLE IF NOT EXISTS decking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID UNIQUE NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  crew_rates JSONB NOT NULL DEFAULT '{}'::jsonb,
  permit_fees JSONB NOT NULL DEFAULT '{}'::jsonb,
  engineering_fee NUMERIC NOT NULL DEFAULT 1500,
  railing_costs JSONB NOT NULL DEFAULT '{}'::jsonb,
  stair_tread_costs JSONB NOT NULL DEFAULT '{}'::jsonb,
  waste_factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add estimator_type to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimator_type TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS decking_data JSONB;

-- RLS policies for decking_settings
ALTER TABLE decking_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can read own decking settings"
  ON decking_settings FOR SELECT
  USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own decking settings"
  ON decking_settings FOR INSERT
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own decking settings"
  ON decking_settings FOR UPDATE
  USING (contractor_id = auth.uid());

-- Public read for enabled contractors (for public estimator pages)
CREATE POLICY "Public can read enabled decking settings"
  ON decking_settings FOR SELECT
  USING (
    is_enabled = TRUE
    AND contractor_id IN (
      SELECT id FROM contractors WHERE plan_status IN ('active', 'trialing')
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_decking_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decking_settings_updated_at
  BEFORE UPDATE ON decking_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_decking_settings_updated_at();
