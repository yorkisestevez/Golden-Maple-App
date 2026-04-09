-- Contractors (customers of EstimateAI)
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#D4AF63',
  secondary_color TEXT DEFAULT '#6B1E2E',
  background_color TEXT DEFAULT '#0F0E0A',
  card_color TEXT DEFAULT '#1A1814',
  text_color TEXT DEFAULT '#F2EEE7',
  headline_font TEXT DEFAULT 'Cormorant Garamond',
  body_font TEXT DEFAULT 'Jost',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'standard' CHECK (plan IN ('standard', 'pro', 'agency')),
  plan_status TEXT DEFAULT 'trialing' CHECK (plan_status IN ('trialing', 'active', 'past_due', 'canceled')),
  trial_ends_at TIMESTAMPTZ,
  notification_email TEXT,
  notification_phone TEXT,
  webhook_url TEXT,
  ai_insights_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  unit TEXT NOT NULL,
  is_slider BOOLEAN DEFAULT TRUE,
  slider_min INTEGER DEFAULT 100,
  slider_max INTEGER DEFAULT 2000,
  slider_step INTEGER DEFAULT 25,
  default_qty INTEGER DEFAULT 400,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  prod_rate_good_low NUMERIC,
  prod_rate_good_high NUMERIC,
  prod_rate_better_low NUMERIC,
  prod_rate_better_high NUMERIC,
  prod_rate_best_low NUMERIC,
  prod_rate_best_high NUMERIC,
  days_good_low NUMERIC,
  days_good_high NUMERIC,
  days_better_low NUMERIC,
  days_better_high NUMERIC,
  days_best_low NUMERIC,
  days_best_high NUMERIC,
  mat_cost_good_low NUMERIC NOT NULL,
  mat_cost_good_high NUMERIC NOT NULL,
  mat_cost_better_low NUMERIC NOT NULL,
  mat_cost_better_high NUMERIC NOT NULL,
  mat_cost_best_low NUMERIC NOT NULL,
  mat_cost_best_high NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contractor_id, key)
);

CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID UNIQUE REFERENCES contractors(id) ON DELETE CASCADE,
  crew_rate_per_day NUMERIC NOT NULL DEFAULT 3000,
  crew_multiplier NUMERIC NOT NULL DEFAULT 1.25,
  tier_good_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  tier_better_multiplier NUMERIC NOT NULL DEFAULT 1.15,
  tier_best_multiplier NUMERIC NOT NULL DEFAULT 1.35,
  tier_good_label TEXT DEFAULT 'Good',
  tier_good_desc TEXT DEFAULT 'Standard materials, clean & functional.',
  tier_better_label TEXT DEFAULT 'Better',
  tier_better_desc TEXT DEFAULT 'Upgraded materials, more design complexity.',
  tier_best_label TEXT DEFAULT 'Best',
  tier_best_desc TEXT DEFAULT 'Premium materials, complex design, full vision.',
  site_standard_add_days NUMERIC DEFAULT 0,
  site_moderate_add_days NUMERIC DEFAULT 0.5,
  site_complex_add_days NUMERIC DEFAULT 1,
  rounding_increment NUMERIC DEFAULT 500,
  minimum_estimate NUMERIC DEFAULT 5000,
  show_hst BOOLEAN DEFAULT TRUE,
  hst_rate NUMERIC DEFAULT 0.13,
  currency TEXT DEFAULT 'CAD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  notes TEXT,
  selected_features JSONB NOT NULL,
  tier TEXT NOT NULL,
  site_condition TEXT NOT NULL,
  estimate_low NUMERIC NOT NULL,
  estimate_high NUMERIC NOT NULL,
  estimate_mid NUMERIC NOT NULL,
  breakdown JSONB NOT NULL,
  ai_insight TEXT,
  source TEXT DEFAULT 'website',
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_contractor ON leads(contractor_id);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_status ON leads(contractor_id, status);
CREATE INDEX idx_services_contractor ON services(contractor_id);
CREATE INDEX idx_usage_contractor ON usage_logs(contractor_id, created_at);

ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contractors_own_data" ON contractors FOR ALL USING (auth.uid() = id);
CREATE POLICY "services_own_data" ON services FOR ALL USING (contractor_id = auth.uid());
CREATE POLICY "pricing_own_data" ON pricing_config FOR ALL USING (contractor_id = auth.uid());
CREATE POLICY "leads_own_data" ON leads FOR ALL USING (contractor_id = auth.uid());
CREATE POLICY "usage_own_data" ON usage_logs FOR ALL USING (contractor_id = auth.uid());

CREATE POLICY "public_contractor_brand" ON contractors FOR SELECT USING (plan_status IN ('active', 'trialing'));
CREATE POLICY "public_services" ON services FOR SELECT USING (is_active = TRUE AND contractor_id IN (SELECT id FROM contractors WHERE plan_status IN ('active', 'trialing')));
CREATE POLICY "public_pricing_config" ON pricing_config FOR SELECT USING (contractor_id IN (SELECT id FROM contractors WHERE plan_status IN ('active', 'trialing')));
CREATE POLICY "public_lead_insert" ON leads FOR INSERT WITH CHECK (contractor_id IN (SELECT id FROM contractors WHERE plan_status IN ('active', 'trialing')));
