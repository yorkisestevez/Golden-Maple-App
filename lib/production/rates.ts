
import { ProductionRate, ProductionUnit } from '../../types';
import { STORAGE_KEYS, getJSON, setJSON } from '../storage';
import { savePreset, PRESET_NAMES } from '../presets';

const DEFAULT_RATES: ProductionRate[] = [
  {
    id: 'pr-excavation',
    taskName: 'Standard Excavation (12")',
    category: 'excavation',
    unit: 'SQFT',
    baseUnitsPerHour: 40,
    complexityMultipliers: { normal: 1, complex: 1.5, restricted: 2.2 },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pr-paver-laying',
    taskName: 'Paver Laying (Normal Pattern)',
    category: 'hardscape',
    unit: 'SQFT',
    baseUnitsPerHour: 25,
    complexityMultipliers: { normal: 1, complex: 1.4, restricted: 1.8 },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pr-base-install',
    taskName: 'Aggregates & Compaction',
    category: 'hardscape',
    unit: 'SQFT',
    baseUnitsPerHour: 30,
    complexityMultipliers: { normal: 1, complex: 1.2, restricted: 2.0 },
    updatedAt: new Date().toISOString()
  }
];

export const listProductionRates = (): ProductionRate[] => {
  const existing = getJSON<ProductionRate[]>(STORAGE_KEYS.PRODUCTION_RATES, []);
  if (existing.length === 0) {
    setJSON(STORAGE_KEYS.PRODUCTION_RATES, DEFAULT_RATES);
    return DEFAULT_RATES;
  }
  return existing;
};

export const computeLaborHours = (
  rateId: string, 
  quantity: number, 
  difficulty: keyof ProductionRate['complexityMultipliers'] = 'normal'
): number => {
  const rates = listProductionRates();
  const rate = rates.find(r => r.id === rateId);
  if (!rate) return 0;

  const multiplier = rate.complexityMultipliers[difficulty] || 1;
  const effectiveUnitsPerHour = rate.baseUnitsPerHour / multiplier;
  
  return quantity / effectiveUnitsPerHour;
};

export const saveRate = (rate: ProductionRate) => {
  const all = listProductionRates();
  const updated = all.find(r => r.id === rate.id)
    ? all.map(r => r.id === rate.id ? rate : r)
    : [...all, rate];
  setJSON(STORAGE_KEYS.PRODUCTION_RATES, updated);
  void savePreset(PRESET_NAMES.PRODUCTION_RATES, updated);
};
