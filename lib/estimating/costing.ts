
import { EmployeeV2, EstimatingSettings } from '../../types';

// Updated to use EmployeeV2 canonical interface
export const computeLoadedRate = (emp: EmployeeV2, settings: EstimatingSettings): number => {
  let baseHourly = emp.pay.baseRate || 0;
  if (emp.employmentType === 'salary') {
    // Fixed: Accessed salaryHoursPerYear via the labor property of EstimatingSettings
    baseHourly = (emp.pay.salaryAnnual || 0) / settings.labor.salaryHoursPerYear;
  }
  
  // Logic uses provided burden override or falls back to system defaults
  const burdenPercent = emp.burden.burdenPercentOverride !== null 
    ? emp.burden.burdenPercentOverride 
    : settings.labor.burdenPercentDefault;

  return baseHourly * (1 + (burdenPercent / 100));
};

export const computeTotalMonthlyOverhead = (settings: EstimatingSettings): number => {
  // Fixed: Accessed fixedCategories via the overhead property of EstimatingSettings
  const fixed = settings.overhead.fixedCategories.reduce((acc, cat) => acc + cat.amount, 0);
  // Variable could be handled during specific job estimation based on project revenue
  return fixed;
};

export const computeOverheadRate = (settings: EstimatingSettings): number => {
  // Fixed: Correctly accessed allocationMethod and expectedBillableHoursPerPeriod nested under overhead property
  if (settings.overhead.allocationMethod === 'perBillableHour') {
    const total = computeTotalMonthlyOverhead(settings);
    return total / (settings.overhead.expectedBillableHoursPerPeriod || 1);
  }
  return 0;
};

export const applyMarkup = (cost: number, markupPercent: number): number => {
  return cost * (1 + (markupPercent / 100));
};

export const computePriceFromTargets = (totalCost: number, targetGrossMargin: number): number => {
  if (targetGrossMargin >= 100) return totalCost * 2;
  return totalCost / (1 - (targetGrossMargin / 100));
};
