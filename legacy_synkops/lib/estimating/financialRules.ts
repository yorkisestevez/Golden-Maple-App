
import { FinancialRules, EstimatingSettings, RoundingStep, LineItemRounding, EmployeeV2 } from '../../types';

/**
 * CORE FINANCIAL ESTIMATING ENGINE
 * Reusable pure functions for financial calculations.
 */

export const computeTax = (
  subtotal: number, 
  categoryTotals: { materials: number; labor: number; subs: number; equipment: number; logistics: number },
  settings: FinancialRules
): number => {
  if (!settings.taxEnabled) return 0;

  let taxableAmount = 0;
  if (settings.taxAppliesTo.materials) taxableAmount += categoryTotals.materials;
  if (settings.taxAppliesTo.labor) taxableAmount += categoryTotals.labor;
  if (settings.taxAppliesTo.subs) taxableAmount += categoryTotals.subs;
  if (settings.taxAppliesTo.equipment) taxableAmount += categoryTotals.equipment;
  if (settings.taxAppliesTo.logistics) taxableAmount += categoryTotals.logistics;

  const rawTax = taxableAmount * (settings.taxRatePercent / 100);

  // Rounding Rule
  if (settings.taxRoundingRule === 'none') return rawTax;
  return Math.round(rawTax * 100) / 100;
};

export const computeOverheadRate = (settings: EstimatingSettings['overhead']): number => {
  const fixedTotal = settings.fixedCategories.reduce((acc, cat) => acc + cat.amount, 0);
  
  if (settings.allocationMethod === 'perBillableHour') {
    const hours = settings.expectedBillableHoursPerPeriod * (settings.utilizationPercent / 100);
    return hours > 0 ? fixedTotal / hours : 0;
  }
  
  // Method is handled during specific estimate pricing
  return 0;
};

/**
 * Standard Loaded Rate Calculator for EmployeeV2 compatibility
 */
export const computeLoadedRate = (
  baseRate: number, 
  burdenPercent: number, 
  payType: 'hourly' | 'salary',
  settings: EstimatingSettings['labor']
): number => {
  let hourlyRate = baseRate;
  if (payType === 'salary') {
    hourlyRate = baseRate / settings.salaryHoursPerYear;
  }
  return hourlyRate * (1 + (burdenPercent / 100));
};

export const applyRounding = (amount: number, rule: RoundingStep | LineItemRounding): number => {
  if (rule === 'none') return amount;
  const step = parseFloat(rule);
  if (isNaN(step)) {
    // Handle nearest_X strings from LineItemRounding
    const match = rule.match(/nearest_([\d.]+)/);
    if (match) return Math.round(amount / parseFloat(match[1])) * parseFloat(match[1]);
    return amount;
  }
  return Math.round(amount / step) * step;
};

export const applyMarkup = (cost: number, markupPercent: number): number => {
  return cost * (1 + (markupPercent / 100));
};

export const priceFromMargin = (cost: number, targetMarginPercent: number): number => {
  if (targetMarginPercent >= 100) return cost * 2; // Safety fallback
  return cost / (1 - (targetMarginPercent / 100));
};

export interface CostBreakdown {
  materials: number;
  laborHours: number;
  laborCostRaw: number;
  subs: number;
  equipment: number;
  logistics: number;
}

export const computeEstimatePrice = (
  costs: CostBreakdown,
  settings: EstimatingSettings,
  finSettings: FinancialRules
): { total: number; subtotal: number; tax: number; overheadRecovered: number } => {
  
  const overheadRate = computeOverheadRate(settings.overhead);
  let overheadRecovered = 0;

  if (settings.overhead.allocationMethod === 'perBillableHour') {
    overheadRecovered = costs.laborHours * overheadRate;
  }

  // Loaded Labor
  const laborWithOverhead = costs.laborCostRaw + (settings.pricingStrategy.includeOverheadInCost ? overheadRecovered : 0);

  let finalSubtotal = 0;

  if (settings.pricingStrategy.mode === 'markup') {
    const m = settings.pricingStrategy;
    finalSubtotal += applyMarkup(laborWithOverhead, m.markupLaborPercent);
    finalSubtotal += applyMarkup(costs.materials, m.markupMaterialsPercent);
    finalSubtotal += applyMarkup(costs.subs, m.markupSubPercent);
    finalSubtotal += applyMarkup(costs.equipment, m.markupEquipmentPercent);
    finalSubtotal += costs.logistics;
  } else {
    // Margin Target
    const totalCost = laborWithOverhead + costs.materials + costs.subs + costs.equipment + costs.logistics;
    finalSubtotal = priceFromMargin(totalCost, settings.pricingStrategy.targetGrossMarginPercent);
  }

  // Contingency
  finalSubtotal = applyMarkup(finalSubtotal, settings.pricingStrategy.contingencyPercent);

  // Rounding
  finalSubtotal = applyRounding(finalSubtotal, finSettings.rounding.totalsTo);

  const tax = computeTax(finalSubtotal, {
    materials: costs.materials,
    labor: laborWithOverhead, // Approximate for tax logic
    subs: costs.subs,
    equipment: costs.equipment,
    logistics: costs.logistics
  }, finSettings);

  return {
    subtotal: finalSubtotal,
    tax,
    total: finalSubtotal + tax,
    overheadRecovered
  };
};
