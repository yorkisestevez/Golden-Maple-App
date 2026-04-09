import { EstimatorShell } from '@/components/estimator/EstimatorShell';
import { DEFAULT_SERVICES, DEFAULT_PRICING_CONFIG } from '@/lib/seed-data';
import { Contractor, Service, PricingConfig } from '@/lib/types';

export const metadata = {
  title: 'Live Demo — EstimateAI',
  robots: 'noindex',
};

export default function DemoEstimatorPage() {
  const demoContractor: Contractor = {
    id: 'demo',
    email: 'demo@estimateai.com',
    company_name: 'Golden Maple Landscaping',
    slug: 'demo',
    phone: '(555) 123-4567',
    website: 'https://estimateai.com',
    logo_url: null,
    primary_color: '#D4AF63',
    secondary_color: '#6B1E2E',
    background_color: '#0F0E0A',
    card_color: '#1A1814',
    text_color: '#F2EEE7',
    headline_font: 'Georgia',
    body_font: 'system-ui',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    plan: 'agency',
    plan_status: 'active',
    trial_ends_at: null,
    notification_email: null,
    notification_phone: null,
    webhook_url: null,
    ai_insights_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const demoServices: Service[] = DEFAULT_SERVICES.map((s, i) => ({
    ...s,
    id: `demo-${i}`,
    contractor_id: 'demo',
    created_at: new Date().toISOString(),
  }));

  const demoConfig: PricingConfig = {
    id: 'demo-config',
    contractor_id: 'demo',
    ...DEFAULT_PRICING_CONFIG,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <EstimatorShell
      contractor={demoContractor}
      services={demoServices}
      config={demoConfig}
      source="website"
    />
  );
}
