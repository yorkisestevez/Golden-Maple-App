import {
  MATERIAL_TIERS,
  CREW_DAY_RATES,
  PERMIT_FEES,
  DEFAULT_ENGINEERING_FEE,
  RAILING_COSTS,
  STAIR_TREAD_COSTS,
  WASTE_FACTORS,
  type DeckingSettings,
} from './types';

export const DEFAULT_DECKING_SETTINGS: DeckingSettings = {
  materials: MATERIAL_TIERS,
  crewRates: CREW_DAY_RATES,
  permitFees: PERMIT_FEES,
  engineeringFee: DEFAULT_ENGINEERING_FEE,
  railingCosts: RAILING_COSTS,
  stairTreadCosts: STAIR_TREAD_COSTS,
  wasteFactors: WASTE_FACTORS,
  isEnabled: true,
};
