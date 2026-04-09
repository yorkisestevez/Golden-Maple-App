import { Service, PricingConfig, ServiceEstimate, CombinedEstimate, TierKey, SiteKey } from './types';

export function calcServiceEstimate(
  service: Service,
  qty: number,
  tierKey: TierKey,
  config: PricingConfig
): ServiceEstimate {
  const tierMultiplier = config[`tier_${tierKey}_multiplier` as keyof PricingConfig] as number;
  let laborLow: number, laborHigh: number;

  if (service.days_good_low !== null) {
    // Fixed-scope projects (kitchen, firepit, pergola, lighting)
    const daysLow = (service[`days_${tierKey}_low` as keyof Service] as number) * config.crew_multiplier;
    const daysHigh = (service[`days_${tierKey}_high` as keyof Service] as number) * config.crew_multiplier;
    const roundedLow = Math.ceil(daysLow * 2) / 2;
    const roundedHigh = Math.ceil(daysHigh * 2) / 2;
    laborLow = roundedLow * config.crew_rate_per_day * tierMultiplier;
    laborHigh = roundedHigh * config.crew_rate_per_day * tierMultiplier;
  } else {
    // Area/length-based projects
    const rateHigh = (service[`prod_rate_${tierKey}_low` as keyof Service] as number) / config.crew_multiplier;
    const rateLow = (service[`prod_rate_${tierKey}_high` as keyof Service] as number) / config.crew_multiplier;
    const daysHigh = qty / rateHigh;
    const daysLow = qty / rateLow;
    const roundedDaysLow = Math.ceil(daysLow * 2) / 2;
    const roundedDaysHigh = Math.ceil(daysHigh * 2) / 2;
    laborLow = roundedDaysLow * config.crew_rate_per_day * tierMultiplier;
    laborHigh = roundedDaysHigh * config.crew_rate_per_day * tierMultiplier;
  }

  const matLow = (service[`mat_cost_${tierKey}_low` as keyof Service] as number) * qty;
  const matHigh = (service[`mat_cost_${tierKey}_high` as keyof Service] as number) * qty;

  return {
    key: service.key,
    label: service.label,
    qty,
    unit: service.unit,
    laborLow: Math.round(laborLow),
    laborHigh: Math.round(laborHigh),
    matLow: Math.round(matLow),
    matHigh: Math.round(matHigh),
    totalLow: Math.round(laborLow + matLow),
    totalHigh: Math.round(laborHigh + matHigh),
  };
}

export function calcCombinedEstimate(
  services: { service: Service; qty: number }[],
  tierKey: TierKey,
  siteKey: SiteKey,
  config: PricingConfig
): CombinedEstimate {
  const items = services.map(({ service, qty }) =>
    calcServiceEstimate(service, qty, tierKey, config)
  );

  const siteAddDays = config[`site_${siteKey}_add_days` as keyof PricingConfig] as number;

  let laborLow = items.reduce((sum, i) => sum + i.laborLow, 0);
  let laborHigh = items.reduce((sum, i) => sum + i.laborHigh, 0);
  const matLow = items.reduce((sum, i) => sum + i.matLow, 0);
  const matHigh = items.reduce((sum, i) => sum + i.matHigh, 0);

  const siteLaborAdd = siteAddDays * config.crew_rate_per_day;
  laborLow += siteLaborAdd;
  laborHigh += siteLaborAdd;

  const prepLaborLow = 0.5 * config.crew_rate_per_day;
  const prepLaborHigh = 1.0 * config.crew_rate_per_day;
  laborLow += prepLaborLow;
  laborHigh += prepLaborHigh;

  let totalLow = laborLow + matLow;
  let totalHigh = laborHigh + matHigh;

  const r = config.rounding_increment;
  totalLow = Math.round(totalLow / r) * r;
  totalHigh = Math.round(totalHigh / r) * r;

  totalLow = Math.max(config.minimum_estimate, totalLow);
  totalHigh = Math.max(totalLow, totalHigh);

  return {
    items,
    laborLow,
    laborHigh,
    matLow,
    matHigh,
    totalLow,
    totalHigh,
    mid: Math.round((totalLow + totalHigh) / 2),
    prepLaborLow,
    prepLaborHigh,
  };
}

export function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
