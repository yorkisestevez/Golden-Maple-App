export interface Contractor {
  id: string;
  email: string;
  company_name: string;
  slug: string;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  card_color: string;
  text_color: string;
  headline_font: string;
  body_font: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'standard' | 'pro' | 'agency';
  plan_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string | null;
  notification_email: string | null;
  notification_phone: string | null;
  webhook_url: string | null;
  ai_insights_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  contractor_id: string;
  key: string;
  label: string;
  unit: string;
  is_slider: boolean;
  slider_min: number;
  slider_max: number;
  slider_step: number;
  default_qty: number;
  display_order: number;
  is_active: boolean;
  prod_rate_good_low: number | null;
  prod_rate_good_high: number | null;
  prod_rate_better_low: number | null;
  prod_rate_better_high: number | null;
  prod_rate_best_low: number | null;
  prod_rate_best_high: number | null;
  days_good_low: number | null;
  days_good_high: number | null;
  days_better_low: number | null;
  days_better_high: number | null;
  days_best_low: number | null;
  days_best_high: number | null;
  mat_cost_good_low: number;
  mat_cost_good_high: number;
  mat_cost_better_low: number;
  mat_cost_better_high: number;
  mat_cost_best_low: number;
  mat_cost_best_high: number;
  created_at: string;
}

export interface PricingConfig {
  id: string;
  contractor_id: string;
  crew_rate_per_day: number;
  crew_multiplier: number;
  tier_good_multiplier: number;
  tier_better_multiplier: number;
  tier_best_multiplier: number;
  tier_good_label: string;
  tier_good_desc: string;
  tier_better_label: string;
  tier_better_desc: string;
  tier_best_label: string;
  tier_best_desc: string;
  site_standard_add_days: number;
  site_moderate_add_days: number;
  site_complex_add_days: number;
  rounding_increment: number;
  minimum_estimate: number;
  show_hst: boolean;
  hst_rate: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  contractor_id: string;
  name: string;
  email: string | null;
  phone: string;
  notes: string | null;
  selected_features: SelectedFeature[];
  tier: string;
  site_condition: string;
  estimate_low: number;
  estimate_high: number;
  estimate_mid: number;
  breakdown: ServiceEstimate[];
  ai_insight: string | null;
  source: 'website' | 'embed' | 'direct';
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ip_address: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  contacted_at: string | null;
  created_at: string;
}

export interface SelectedFeature {
  key: string;
  label: string;
  qty: number;
  unit: string;
}

export interface ServiceEstimate {
  key: string;
  label: string;
  qty: number;
  unit: string;
  laborLow: number;
  laborHigh: number;
  matLow: number;
  matHigh: number;
  totalLow: number;
  totalHigh: number;
}

export interface CombinedEstimate {
  items: ServiceEstimate[];
  laborLow: number;
  laborHigh: number;
  matLow: number;
  matHigh: number;
  totalLow: number;
  totalHigh: number;
  mid: number;
  prepLaborLow: number;
  prepLaborHigh: number;
}

export type TierKey = 'good' | 'better' | 'best';
export type SiteKey = 'standard' | 'moderate' | 'complex';

export interface UsageLog {
  id: string;
  contractor_id: string;
  event_type: 'estimate_view' | 'ai_insight' | 'lead_submit';
  metadata: Record<string, unknown> | null;
  created_at: string;
}
