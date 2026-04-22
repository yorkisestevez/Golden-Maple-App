export type DeckType = 'Attached' | 'Freestanding' | 'Floating' | 'Add-on';
export type Municipality = 'Toronto' | 'Barrie' | 'Simcoe County' | 'Burlington-Oakville' | 'Rural-Other';
export type SiteType = 'Standard' | 'Waterfront-Lakefront' | 'Hillside' | 'Urban Tight' | 'Island-Ferry';
export type SoilCondition = 'Unknown' | 'Sandy' | 'Clay' | 'Shallow Bedrock' | 'Fill';
export type BuildSeason = 'Spring-Summer' | 'Fall' | 'Winter';
export type IntendedLoad = 'Standard' | 'Heavy';
export type DeckShape = 'Rectangle' | 'L-Shape' | 'Multi-corner' | 'Curved';
export type BoardPattern = 'Straight' | 'Diagonal' | 'Picture Frame' | 'Herringbone';
export type RailingType = 'None' | 'Wood Picket' | 'Aluminum' | 'Cable' | 'Glass Panels' | 'Trex Select' | 'Trex Transcend' | 'Fortress AL13' | 'TT Classic' | 'TT Impression';
export type StairType = 'Straight' | 'Winder' | 'Landing';
export type FoundationType = 'Concrete Piers' | 'Helical Piles' | 'Deck Blocks';

export interface LightingProduct {
  id: string;
  name: string;
  category: 'Transformer' | 'Recessed' | 'Surface' | 'Bollard' | 'Accessory';
  cost: number;
  laborCost: number;
  description?: string;
}

export const INLITE_PRODUCTS: LightingProduct[] = [
  { id: 'hub50', name: 'HUB-50', category: 'Transformer', cost: 265, laborCost: 150, description: '50W Standard Transformer' },
  { id: 'hub100', name: 'HUB-100', category: 'Transformer', cost: 315, laborCost: 150, description: '100W Standard Transformer' },
  { id: 'smart_hub150', name: 'SMART HUB-150', category: 'Transformer', cost: 645, laborCost: 185, description: '150W Bluetooth Smart Transformer' },
  { id: 'puck', name: 'PUCK (Dark)', category: 'Recessed', cost: 55, laborCost: 55, description: '22mm Recessed Deck Light' },
  { id: 'fusion', name: 'FUSION', category: 'Recessed', cost: 65, laborCost: 55, description: '60mm Integrated Deck Light' },
  { id: 'hyve', name: 'HYVE', category: 'Recessed', cost: 58, laborCost: 55, description: 'Subtle 60mm Recessed Light' },
  { id: 'evo_hyde', name: 'EVO HYDE', category: 'Surface', cost: 145, laborCost: 65, description: 'Linear Under-cap Light' },
  { id: 'wedge', name: 'WEDGE', category: 'Surface', cost: 75, laborCost: 65, description: 'Surface Mounted Wall/Stair Light' },
  { id: 'blink', name: 'BLINK', category: 'Surface', cost: 85, laborCost: 65, description: 'Compact Surface Light' },
  { id: 'ace', name: 'ACE Bollard', category: 'Bollard', cost: 185, laborCost: 75, description: 'Directional Path Light' },
  { id: 'liv', name: 'LIV Bollard', category: 'Bollard', cost: 165, laborCost: 75, description: '360 Degree Path Light' },
  { id: 'scope', name: 'SCOPE Spotlight', category: 'Bollard', cost: 125, laborCost: 75, description: 'Accent Spotlight' },
  { id: 'smart_move', name: 'SMART MOVE', category: 'Accessory', cost: 125, laborCost: 45, description: 'Wireless Motion Sensor' },
  { id: 'smart_bridge', name: 'SMART BRIDGE', category: 'Accessory', cost: 245, laborCost: 85, description: 'Wi-Fi Bridge for Remote Control' },
  { id: 'smart_extender', name: 'SMART EXTENDER', category: 'Accessory', cost: 95, laborCost: 25, description: 'Bluetooth Range Extender' },
  { id: 'cable_14_2', name: '14/2 Cable (100ft)', category: 'Accessory', cost: 185, laborCost: 0, description: 'Standard Low Voltage Cable' },
  { id: 'cable_12_2', name: '12/2 Cable (100ft)', category: 'Accessory', cost: 245, laborCost: 0, description: 'Heavy Duty Low Voltage Cable' },
];

export interface DeckData {
  deckType: DeckType;
  municipality: Municipality;
  siteType: SiteType;
  soilCondition: SoilCondition;
  buildSeason: BuildSeason;
  intendedLoad: IntendedLoad;
  foundation: FoundationType;
  width: number;
  length: number;
  height: number;
  cutoutWidth: number;
  cutoutLength: number;
  width2: number;
  length2: number;
  height2: number;
  cutoutWidth2: number;
  cutoutLength2: number;
  shape: DeckShape;
  levels: number;
  pattern: BoardPattern;
  deckingMaterial: string;
  framingSize: '2x8' | '2x10' | '2x12';
  boardWidth: 5.5 | 3.5;
  joistSpacing: 12 | 16;
  fasteningSystem: 'Face' | 'Hidden';
  pictureFrameRows: 0 | 1 | 2;
  hasInlay: boolean;
  inlayLf: number;
  railingType: RailingType;
  railingLf: number;
  stairFlights: number;
  stairWidth: number;
  stairType: StairType;
  stairPosition: 'Front' | 'Left' | 'Right' | 'Back';
  stairOffset: number;
  lightingSystem: {
    selectedItems: { productId: string; qty: number }[];
    wireDistance: number;
  };
  benchLf: number;
  privacySqft: number;
  hasDrainage: boolean;
  hasDemo: boolean;
  pergolaSqft: number;
  addOnTransitionLabor?: number;
  addOnHardwareCost?: number;
  addOnFlashingLf?: number;
  customLaborCost?: number;
  materialMarkup?: number;
  customOverrides?: Record<string, { qty?: number; cost?: number }>;
  customerName: string;
  projectAddress: string;
  scopeOfWork: string;
}

export interface MaterialTier {
  id: string;
  name: string;
  tier: string;
  priceRange: string;
  costPerSqft: number;
  isComposite: boolean;
  isHidden: boolean;
}

export const MATERIAL_TIERS: MaterialTier[] = [
  { id: 'pine', name: 'PT Pine 5/4x6', tier: 'Budget', priceRange: '$2.50-$4.00', costPerSqft: 3.25, isComposite: false, isHidden: false },
  { id: 'brown_pt', name: 'Brown PT 5/4x6', tier: 'Budget+', priceRange: '$3.00-$4.50', costPerSqft: 3.75, isComposite: false, isHidden: false },
  { id: 'cedar', name: 'Western Red Cedar 5/4x6', tier: 'Mid', priceRange: '$5.00-$8.00', costPerSqft: 6.50, isComposite: false, isHidden: false },
  { id: 'ipe', name: 'Ipe Hardwood', tier: 'Ultra-Premium', priceRange: '$25.00-$35.00', costPerSqft: 28.00, isComposite: false, isHidden: false },
  { id: 'trex_enhance', name: 'Trex Enhance', tier: 'Entry Composite', priceRange: '$4.51/LF', costPerSqft: 9.84, isComposite: true, isHidden: false },
  { id: 'trex_select', name: 'Trex Select', tier: 'Mid Composite', priceRange: '$5.99/LF', costPerSqft: 13.07, isComposite: true, isHidden: false },
  { id: 'trex_transcend', name: 'Trex Transcend', tier: 'Premium Composite', priceRange: '$9.32/LF', costPerSqft: 20.34, isComposite: true, isHidden: false },
  { id: 'trex_lineage', name: 'Trex Transcend Lineage', tier: 'Ultra-Premium Composite', priceRange: '$16.00-$20.00', costPerSqft: 18.00, isComposite: true, isHidden: false },
  { id: 'deck_venture', name: 'Deckorators Venture', tier: 'Entry Composite', priceRange: '$7.50-$9.50', costPerSqft: 8.50, isComposite: true, isHidden: false },
  { id: 'deck_vista', name: 'Deckorators Vista', tier: 'Mid-Premium Composite', priceRange: '$12.00-$16.00', costPerSqft: 14.00, isComposite: true, isHidden: false },
  { id: 'deck_voyage', name: 'Deckorators Voyage', tier: 'Ultra-Premium (MBC)', priceRange: '$18.00-$24.00', costPerSqft: 21.00, isComposite: true, isHidden: false },
  { id: 'tt_prime', name: 'TimberTech Prime (EDGE)', tier: 'Entry Composite', priceRange: '$7.00-$9.00', costPerSqft: 8.25, isComposite: true, isHidden: false },
  { id: 'tt_prime_plus', name: 'TimberTech Prime+ (EDGE)', tier: 'Entry Composite+', priceRange: '$8.00-$10.00', costPerSqft: 9.00, isComposite: true, isHidden: false },
  { id: 'tt_premier', name: 'TimberTech Premier (EDGE)', tier: 'Entry Composite+', priceRange: '$8.50-$10.50', costPerSqft: 9.50, isComposite: true, isHidden: false },
  { id: 'tt_terrain', name: 'TimberTech Terrain (PRO)', tier: 'Mid Composite', priceRange: '$10.00-$13.00', costPerSqft: 11.50, isComposite: true, isHidden: false },
  { id: 'tt_reserve', name: 'TimberTech Reserve (PRO)', tier: 'Mid-Premium Composite', priceRange: '$12.00-$15.00', costPerSqft: 13.50, isComposite: true, isHidden: false },
  { id: 'tt_legacy', name: 'TimberTech Legacy (PRO)', tier: 'Premium Composite', priceRange: '$16.00-$20.00', costPerSqft: 18.50, isComposite: true, isHidden: false },
  { id: 'tt_landmark_pro', name: 'TimberTech Landmark (PRO)', tier: 'Premium Composite', priceRange: '$16.00-$20.00', costPerSqft: 18.50, isComposite: true, isHidden: false },
  { id: 'tt_harvest', name: 'TimberTech Harvest (AZEK)', tier: 'Premium PVC', priceRange: '$14.00-$18.00', costPerSqft: 16.00, isComposite: true, isHidden: false },
  { id: 'tt_landmark_azek', name: 'TimberTech Landmark (AZEK)', tier: 'Ultra-Premium PVC', priceRange: '$18.00-$24.00', costPerSqft: 21.00, isComposite: true, isHidden: false },
  { id: 'tt_vintage', name: 'TimberTech Vintage (AZEK)', tier: 'Ultra-Premium PVC', priceRange: '$20.00-$26.00', costPerSqft: 23.00, isComposite: true, isHidden: false },
];

export const WASTE_FACTORS: Record<BoardPattern, number> = {
  'Straight': 1.10,
  'Diagonal': 1.18,
  'Picture Frame': 1.22,
  'Herringbone': 1.25,
};

export const CREW_DAY_RATES: Record<Municipality, number> = {
  'Toronto': 1350,
  'Barrie': 1180,
  'Simcoe County': 1220,
  'Burlington-Oakville': 1220,
  'Rural-Other': 1220,
};

export const PERMIT_FEES: Record<Municipality, number> = {
  'Toronto': 215,
  'Barrie': 225,
  'Simcoe County': 200,
  'Burlington-Oakville': 280,
  'Rural-Other': 175,
};

export const DEFAULT_ENGINEERING_FEE = 1500;

export const RAILING_COSTS: Record<Exclude<RailingType, 'None'>, { material: number; install: number; spacing: number; postCost: number }> = {
  'Wood Picket': { material: 35, install: 45, spacing: 6, postCost: 45 },
  'Aluminum': { material: 60, install: 55, spacing: 6, postCost: 95 },
  'Cable': { material: 90, install: 90, spacing: 4, postCost: 120 },
  'Glass Panels': { material: 160, install: 95, spacing: 3, postCost: 150 },
  'Trex Select': { material: 40, install: 55, spacing: 8, postCost: 95 },
  'Trex Transcend': { material: 75, install: 65, spacing: 8, postCost: 145 },
  'Fortress AL13': { material: 50, install: 55, spacing: 8, postCost: 110 },
  'TT Classic': { material: 65, install: 65, spacing: 8, postCost: 130 },
  'TT Impression': { material: 58, install: 55, spacing: 8, postCost: 105 },
};

export const STAIR_LABOR_MULTIPLIER: Record<StairType, number> = {
  'Straight': 1.0,
  'Winder': 1.5,
  'Landing': 1.75,
};

export const STAIR_TREAD_COSTS: Record<string, number> = {
  'pine': 24,
  'cedar': 40,
  'composite': 85,
};

export const LIGHTING_COSTS = {
  hub75: 295,
  hub150: 645,
  hub300: 995,
  hub50: 265,
  hub100: 315,
  smartHub150: 645,
  puck: 55,
  evo: 145,
  bollard: 85,
  connector: 14.50,
  wirePerFt: 2.50,
  smartMove: 125,
};

export const LABOR_RATES_2026 = {
  construction: {
    standardDeckingBase: 30,
    standardDeckingMax: 45,
    structuralTieIn: 850,
    specialtyFramingSingle: 15,
    specialtyFramingDouble: 25,
  },
  lighting: {
    transformerSetup: 150,
    smartTransformerSetup: 185,
    recessedInstall: 55,
    surfaceInstall: 65,
    bollardInstall: 75,
  },
};

export interface DeckingSettings {
  materials: MaterialTier[];
  crewRates: Record<Municipality, number>;
  permitFees: Record<Municipality, number>;
  engineeringFee: number;
  railingCosts: Record<string, { material: number; install: number; spacing: number; postCost: number }>;
  stairTreadCosts: Record<string, number>;
  wasteFactors: Record<string, number>;
  isEnabled: boolean;
}

export const DEFAULT_DECK_DATA: DeckData = {
  deckType: 'Attached',
  municipality: 'Toronto',
  siteType: 'Standard',
  soilCondition: 'Unknown',
  buildSeason: 'Spring-Summer',
  intendedLoad: 'Standard',
  foundation: 'Concrete Piers',
  width: 16,
  length: 12,
  height: 36,
  cutoutWidth: 8,
  cutoutLength: 6,
  width2: 12,
  length2: 10,
  height2: 12,
  cutoutWidth2: 6,
  cutoutLength2: 5,
  shape: 'Rectangle',
  levels: 1,
  pattern: 'Straight',
  deckingMaterial: 'pine',
  framingSize: '2x10',
  boardWidth: 5.5,
  joistSpacing: 16,
  fasteningSystem: 'Face',
  pictureFrameRows: 0,
  hasInlay: false,
  inlayLf: 0,
  railingType: 'Aluminum',
  railingLf: 40,
  stairFlights: 1,
  stairWidth: 48,
  stairType: 'Straight',
  stairPosition: 'Front',
  stairOffset: 50,
  lightingSystem: { selectedItems: [], wireDistance: 20 },
  benchLf: 0,
  privacySqft: 0,
  hasDrainage: false,
  hasDemo: false,
  pergolaSqft: 0,
  customerName: '',
  projectAddress: '',
  scopeOfWork: 'Professional installation of a custom outdoor deck system including framing, decking, and finishing as per selected specifications. All work to be completed to local building codes and industry best practices.',
};
