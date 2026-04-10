
import { SynkOpsSettingsV1, FinancialBrain, CrewHR, EmployeeV2, UserRole, BusinessProfile, User } from '../../types';
import { safeGetJSON, safeSetJSON } from '../storage';
import { savePreset, PRESET_NAMES } from '../presets';

const SETTINGS_KEY = 'synkops_settings_v1';

export const INITIAL_SETTINGS: SynkOpsSettingsV1 = {
  version: 1,
  updatedAtISO: new Date().toISOString(),
  company: {
    name: 'New Landscaping Co.',
    ownerName: 'John Owner',
    phone: '',
    email: '',
    address: ''
  },
  financialBrain: {
    currency: 'CAD',
    tax: { enabled: true, ratePercent: 13 },
    overhead: {
      mode: 'monthly_overhead',
      monthlyOverhead: 8500,
      billableHoursPerMonth: 160,
      overheadPerBillableHour: null
    },
    labor: {
      laborBurdenPercent: 18,
      defaultCrewEfficiencyPercent: 100
    },
    pricingRules: {
      tradeOnly: true,
      markupMode: 'target_margin',
      targetMarginPercent: 35,
      markupPercent: null,
      minimumJobPrice: null,
      contingencyPercent: 5
    },
    rounding: {
      lineItemRounding: "none",
      totalRounding: "nearest_1"
    },
    computed: {
      computedOverheadPerBillableHour: 53.13,
      recommendedLaborCostMultiplier: 1.82,
      lastComputedAtISO: new Date().toISOString()
    }
  },
  crewHR: {
    employees: [],
    defaults: {
      standardShiftHours: 8,
      overtimeRule: { enabled: false, startsAfterHours: 44, multiplier: 1.5 }
    }
  }
};

/**
 * Global Settings Accessor
 */
export const getSettings = (): SynkOpsSettingsV1 => {
  const stored = safeGetJSON<SynkOpsSettingsV1 | null>(SETTINGS_KEY, null);
  if (!stored || stored.version !== 1) {
    // Attempt migration or return defaults
    return INITIAL_SETTINGS;
  }
  return stored;
};

export const saveSettings = (settings: SynkOpsSettingsV1): void => {
  safeSetJSON(SETTINGS_KEY, { ...settings, updatedAtISO: new Date().toISOString() });
  window.dispatchEvent(new CustomEvent('synkops-settings-updated'));
  void savePreset(PRESET_NAMES.SETTINGS, settings);
};

/**
 * Exports for setting updates from UI components
 */
export const updateSettings = (profile: BusinessProfile, actor: User, section: string): void => {
  console.log(`Settings update requested for ${section} by ${actor.name}`);
  // Implementation for prototype: persist changes back to the SynkOpsSettingsV1 canonical store
  const current = getSettings();
  const updated: SynkOpsSettingsV1 = {
    ...current,
    company: { 
      ...current.company, 
      name: profile.business.displayName,
      ownerName: profile.business.ownerName
    },
    updatedAtISO: new Date().toISOString()
  };
  saveSettings(updated);
};

/**
 * Financial Brain Computations
 */
export const computeFinancials = (brain: FinancialBrain): FinancialBrain => {
  const newBrain = { ...brain };
  
  // 1. Overhead Rate
  let ohRate = 0;
  if (brain.overhead.mode === 'monthly_overhead') {
    const monthly = brain.overhead.monthlyOverhead || 0;
    const hours = brain.overhead.billableHoursPerMonth || 1;
    ohRate = monthly / hours;
  } else {
    ohRate = brain.overhead.overheadPerBillableHour || 0;
  }

  // 2. Labor Multiplier
  const burdenMult = 1 + (brain.labor.laborBurdenPercent / 100);
  let finalMult = burdenMult;
  
  if (brain.pricingRules.markupMode === 'target_margin') {
    const margin = brain.pricingRules.targetMarginPercent || 0;
    finalMult = burdenMult / (1 - (margin / 100));
  } else {
    const markup = brain.pricingRules.markupPercent || 0;
    finalMult = burdenMult * (1 + (markup / 100));
  }

  newBrain.computed = {
    computedOverheadPerBillableHour: Number(ohRate.toFixed(2)),
    recommendedLaborCostMultiplier: Number(finalMult.toFixed(2)),
    lastComputedAtISO: new Date().toISOString()
  };

  return newBrain;
};

/**
 * Crew & HR Computations
 */
export const computeLoadedRate = (emp: EmployeeV2, globalBurdenPercent: number): number => {
  const burden = emp.burden.burdenPercentOverride !== null 
    ? emp.burden.burdenPercentOverride 
    : globalBurdenPercent;
    
  const burdenMultiplier = 1 + (burden / 100);
  
  if (emp.employmentType === 'hourly' && emp.pay.baseRate) {
    return emp.pay.baseRate * burdenMultiplier;
  }
  
  if (emp.employmentType === 'salary' && emp.pay.salaryAnnual) {
    // Standardizing on 52 weeks @ 40 hours for base rate computation
    const baseHourly = emp.pay.salaryAnnual / 52 / 40;
    return baseHourly * burdenMultiplier;
  }
  
  if (emp.employmentType === 'subcontract' && emp.pay.subcontractRate) {
    // Subs don't have company burden unless override is explicitly set
    const subBurden = emp.burden.burdenPercentOverride || 0;
    return emp.pay.subcontractRate * (1 + (subBurden / 100));
  }
  
  return 0;
};

export const syncAllLoadedCosts = (settings: SynkOpsSettingsV1): SynkOpsSettingsV1 => {
  const globalBurden = settings.financialBrain.labor.laborBurdenPercent;
  const updatedEmployees = settings.crewHR.employees.map(emp => ({
    ...emp,
    loadedCost: {
      loadedRate: Number(computeLoadedRate(emp, globalBurden).toFixed(2)),
      lastComputedAtISO: new Date().toISOString()
    }
  }));
  
  return {
    ...settings,
    crewHR: { ...settings.crewHR, employees: updatedEmployees }
  };
};

/**
 * Stub functions for component backward compatibility if needed
 */
export const getActiveProfile = (): BusinessProfile => {
  const s = getSettings();
  return {
    business: { 
      displayName: s.company.name,
      ownerName: s.company.ownerName || 'John Owner'
    },
    branding: { appName: 'SynkOps', accentColor: '#10b981' },
    financial: { 
       currencyCode: s.financialBrain.currency, 
       taxRatePercent: s.financialBrain.tax.ratePercent,
       taxEnabled: s.financialBrain.tax.enabled,
       taxName: 'HST',
       taxInclusivePricing: false,
       taxRoundingRule: 'roundOnSubtotal',
       taxAppliesTo: { materials: true, labor: true, subs: true, equipment: true, logistics: true },
       rounding: { totalsTo: 'none', roundLineItems: false },
       deposit: { percent: 50 },
       minJobSize: s.financialBrain.pricingRules.minimumJobPrice || 0
    },
    estimating: {
      overhead: {
        allocationMethod: 'perBillableHour',
        fixedCategories: [],
        expectedBillableHoursPerPeriod: 160,
        utilizationPercent: 80
      },
      labor: {
        burdenPercentDefault: s.financialBrain.labor.laborBurdenPercent,
        salaryHoursPerYear: 2080
      },
      pricingStrategy: {
        mode: s.financialBrain.pricingRules.markupMode === 'target_margin' ? 'margin' : 'markup',
        markupMaterialsPercent: s.financialBrain.pricingRules.markupPercent || 35,
        markupLaborPercent: 35,
        markupSubPercent: 15,
        markupEquipmentPercent: 20,
        targetGrossMarginPercent: s.financialBrain.pricingRules.targetMarginPercent || 35,
        targetNetProfitPercent: 15,
        contingencyPercent: s.financialBrain.pricingRules.contingencyPercent || 5,
        includeOverheadInCost: true
      }
    },
    integrations: {
       google: { 
         enabled: false, 
         status: 'disconnected', 
         enabledServices: { calendar: false, gmail: false, drive: false, sheets: false, contacts: false, maps: false },
         calendar: { syncMode: 'manual' },
         drive: {},
         sheets: {},
         contacts: { syncMode: 'import' }
       }
    },
    permissions: { employees: [] }
  };
};

export const applyBranding = (b: any) => {};
export const getGlobalSettings = () => ({ profiles: [{ id: 'default', numbering: { sequences: {} } }], activeProfileId: 'default' } as any);
