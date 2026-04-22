import { 
  DeckData, 
  WASTE_FACTORS, 
  STAIR_TREAD_COSTS, 
  STAIR_LABOR_MULTIPLIER, 
  Municipality,
  RailingType,
  LIGHTING_COSTS,
  LABOR_RATES_2026,
  INLITE_PRODUCTS
} from './types';

export interface EstimateResult {
  total: number;
  costPerSqft: number;
  area: number;
  manHours: number;
  calculatedRailingLf: number;
  sections: {
    title: string;
    icon: string;
    description?: string;
    total: number;
    items: { 
      name: string; 
      spec: string; 
      qty: number | string; 
      unit: string; 
      cost: number;
      unitPrice?: number;
      laborCost?: number;
    }[];
  }[];
  flags: string[];
  materialList: { item: string; spec: string; qty: number | string; unit: string; cost: number }[];
  breakerInfo?: {
    required: boolean;
    rows: number;
    interval: number;
    standardLength: number;
    positions1: number[];
    positions2: number[];
  };
}

export function calculateEstimate(data: DeckData, settings?: any): EstimateResult {
  const {
    width, length, height, cutoutWidth, cutoutLength, width2, length2, height2, cutoutWidth2, cutoutLength2, shape, levels, pattern,
    deckType, municipality, siteType, soilCondition, buildSeason, intendedLoad, foundation,
    deckingMaterial, boardWidth, joistSpacing, fasteningSystem, pictureFrameRows, hasInlay, inlayLf,
    railingType, railingLf, stairFlights, stairWidth, stairType,
    lightingSystem, benchLf, privacySqft, hasDrainage, hasDemo, pergolaSqft,
    customLaborCost, materialMarkup
  } = data;

  const materials = settings?.materials || [];
  const crewRates = settings?.crewRates || {};
  const permitFees = settings?.permitFees || {};
  const railingCosts = settings?.railingCosts || {};
  const stairTreadCosts = settings?.stairTreadCosts || {};
  const wasteFactors = settings?.wasteFactors || {};

  let area1 = width * length;
  if (shape === 'L-Shape') {
    area1 -= (cutoutWidth * cutoutLength);
  }
  let area2 = levels > 1 ? width2 * length2 : 0;
  if (levels > 1 && shape === 'L-Shape') {
    area2 -= (cutoutWidth2 * cutoutLength2);
  }
  
  // Landing midway down steps if second level exists
  const landingArea = levels > 1 ? (stairWidth / 12) * (stairWidth / 12) : 0;
  
  const area = area1 + area2 + landingArea;
  const perimeter1 = 2 * (width + length);
  const perimeter2 = levels > 1 ? 2 * (width2 + length2) : 0;
  const perimeter = perimeter1 + perimeter2;
  
  const selectedMaterial = materials.find((m: any) => m.id === deckingMaterial) || materials[0] || { costPerSqft: 3.25, isComposite: false, name: 'PT Pine' };
  
  // Trex / Deckorators behavioral defaults
  const isTrexOrDeck = selectedMaterial.id.startsWith('trex_') || selectedMaterial.id.startsWith('deck_');
  const effectiveJoistSpacing = isTrexOrDeck && pattern === 'Diagonal' ? 12 : joistSpacing;
  const effectiveFasteningSystem = isTrexOrDeck ? 'Hidden' : fasteningSystem;

  const wasteFactor = wasteFactors[pattern] || 1.10;

  // Board Count (Math Engine Formula - Linear Logic)
  const gapIn = selectedMaterial.isComposite ? 0.375 : 0.25;
  const boardWidthIn = boardWidth || 5.5;
  const boardCoverageFt = (boardWidthIn + gapIn) / 12;
  
  // Total Linear Feet (LF) = (Area / Coverage) * Waste
  const totalDeckingLf = (area / boardCoverageFt) * wasteFactor;
  const standard_board_length = selectedMaterial.id === 'cedar' ? 12 : 16;
  const finalBoards = Math.ceil(totalDeckingLf / standard_board_length);
  const deckingCost = totalDeckingLf * (selectedMaterial.costPerSqft * (boardWidthIn / 5.5)); // Adjusted if narrow

  // Framing (Math Engine Formula)
  const joistSpacingFt = effectiveJoistSpacing / 12;
  const joistCount1 = Math.ceil(width / joistSpacingFt) + 1;
  const joistCount2 = levels > 1 ? Math.ceil(width2 / joistSpacingFt) + 1 : 0;
  let joistCount = joistCount1 + joistCount2;
  
  // Framing Exceptions (Picture Frames & Inlays)
  let extraJoists = 0;
  let extraBlockingLf = 0;
  
  // Single Picture Frame: +1 perimeter joist and 2x4 blocking every 12" OC
  if (pictureFrameRows === 1) {
    extraJoists += 1;
    extraBlockingLf += (perimeter * 1.0); // 1 row of blocking
  }
  // Double Picture Frame: +2 perimeter joists and double rows of 2x4 ladder blocking
  if (pictureFrameRows === 2) {
    extraJoists += 2;
    extraBlockingLf += (perimeter * 2.0); // 2 rows of blocking
  }
  
  // Inlays: Add ladder blocking for the inlay board
  if (hasInlay) {
    extraBlockingLf += (inlayLf * 1.5);
  }

  joistCount += extraJoists;
  
  const joistLength1 = length + 1;
  const joistLength2 = levels > 1 ? length2 + 1 : 0;
  
  const rimLf = perimeter;
  const blockingRows1 = Math.floor(length / 8);
  const blockingRows2 = levels > 1 ? Math.floor(length2 / 8) : 0;
  
  const blockingPieces = (blockingRows1 * joistCount1) + (blockingRows2 * joistCount2);
  let totalFramingLf = (joistCount1 * joistLength1) + (joistCount2 * joistLength2) + rimLf + (blockingPieces * joistSpacingFt) + extraBlockingLf;

  // --- BREAKER BOARD LOGIC (Ladder Blocking) ---
  const breaker_interval = standard_board_length - 0.5;
  const unit_cost_per_lf = selectedMaterial.costPerSqft * (boardWidthIn / 12);

  let breaker_rows = 0;
  let total_breaker_boards = 0;
  let breaker_blocking_lf = 0;
  let breaker_labor_hrs = 0;
  let breaker_screws = 0;
  let breaker_required = false;
  let breaker_positions1: number[] = [];
  let breaker_positions2: number[] = [];

  const calculateBreakerForLevel = (l_length: number, l_width: number, l_joist_count: number, positionsArray: number[]) => {
    if (pattern === 'Herringbone') return;
    if (l_length <= standard_board_length) return;

    breaker_required = true;
    const b_rows = Math.floor(l_length / breaker_interval);
    breaker_rows += b_rows;
    
    for (let i = 1; i <= b_rows; i++) {
      positionsArray.push(i * breaker_interval);
    }

    let effective_width = l_width;
    if (pattern === 'Picture Frame') {
      effective_width = l_width - (11 / 12); // 2 * 5.5" border
    }
    
    let boards_per_row = Math.ceil(effective_width / standard_board_length) + 1;
    
    if (pattern === 'Diagonal') {
      boards_per_row = Math.ceil(boards_per_row * 1.15);
    }
    if (shape === 'Curved') {
      boards_per_row = Math.ceil(boards_per_row * 1.20);
    }

    const b_boards = b_rows * boards_per_row;
    total_breaker_boards += b_boards;

    // Ladder Blocking line item (Inlay Length * 1.5)
    const b_blocking = l_width * 1.5 * b_rows;
    breaker_blocking_lf += b_blocking;

    breaker_labor_hrs += b_rows * (l_width / 10) * 1.5;
    
    breaker_screws += b_boards * l_joist_count * 2 * 1.10;
  };

  calculateBreakerForLevel(length, width, joistCount1, breaker_positions1);
  if (levels > 1) {
    calculateBreakerForLevel(length2, width2, joistCount2, breaker_positions2);
  }

  totalFramingLf += breaker_blocking_lf;
  
  const framingSize = data.framingSize || '2x10';
  let framingCostPerLf = 4.50;
  if (framingSize === '2x8') framingCostPerLf = 3.50;
  if (framingSize === '2x12') framingCostPerLf = 5.50;

  const framingCost = totalFramingLf * framingCostPerLf;
  const breaker_blocking_cost = breaker_blocking_lf * framingCostPerLf;
  const breaker_board_cost = total_breaker_boards * standard_board_length * unit_cost_per_lf;
  const breaker_screw_cost = breaker_screws * (effectiveFasteningSystem === 'Hidden' && selectedMaterial.isComposite ? 0.85 : 0.28);

  // Foundation (Math Engine Formula)
  let footingType: string = foundation;
  let footingCostPerUnit = 190; // Concrete Piers default
  let flags: string[] = [];

  if (footingType === 'Helical Piles') {
    footingCostPerUnit = 475;
  } else if (footingType === 'Deck Blocks') {
    footingCostPerUnit = 4.50;
    if (height > 23.5) flags.push('Deck Blocks not recommended for height > 24"');
  } else {
    // Concrete Piers
    if (soilCondition === 'Clay' || soilCondition === 'Fill') {
      footingType = 'Concrete Pier 16"';
      footingCostPerUnit = 240;
    }
  }

  if (siteType === 'Waterfront-Lakefront' || siteType === 'Island-Ferry') {
    flags.push('CA Permit Required');
  }
  if (soilCondition === 'Shallow Bedrock') {
    // Handled in professional fees section
  }

  // Post Footings: ceil(Width/8) * ceil(Depth/8)
  const footingCount = Math.ceil(width / 8) * Math.ceil(length / 8);
  const foundationCost = footingCount * footingCostPerUnit;

  // Fasteners
  const screwsPerBoard = 2 * joistCount;
  const totalScrews = Math.ceil(screwsPerBoard * finalBoards * 1.10);
  const screwCost = effectiveFasteningSystem === 'Face' ? totalScrews * 0.28 : 0;
  const hiddenClipCost = effectiveFasteningSystem === 'Hidden' ? area * 0.85 : 0;
  const joistHangerCost = (joistCount * 2) * 4.50; // (Total Joists * 2)
  const ledgerBoltCost = (deckType === 'Attached' || deckType === 'Add-on') ? (width / 2) * 2 * 2.80 : 0;
  const postAnchorCost = footingCount * 22.00;
  const hardwareTotal = screwCost + hiddenClipCost + joistHangerCost + ledgerBoltCost + postAnchorCost + breaker_screw_cost;

  // Railing (Precise Formulas)
  let railingMaterialCost = 0;
  let railingInstallCost = 0;
  let railingPostCount = 0;
  let railingSectionCount = 0;
  let railingHardwareCost = 0;
  let railingFlags: string[] = [];

  // Calculate Railing LF automatically if not provided or as a base
  let calculatedRailingLf = 0;
  if (railingType !== 'None') {
    // 1. Deck Perimeter Railing
    let deckPerimeter = 0;
    if (deckType === 'Attached' || deckType === 'Add-on') {
      deckPerimeter = (2 * length) + width;
    } else {
      deckPerimeter = 2 * (width + length);
    }

    if (levels > 1) {
      if (deckType === 'Attached' || deckType === 'Add-on') {
        deckPerimeter += (2 * length2) + width2;
      } else {
        deckPerimeter += 2 * (width2 + length2);
      }
    }

    // Subtract stair openings from deck perimeter
    const stairOpeningLf = (stairWidth / 12) * stairFlights;
    calculatedRailingLf = Math.max(0, deckPerimeter - stairOpeningLf);

    // 2. Stair Railing
    const stepCount = Math.ceil(height / 7.5);
    const stairRailingPerSide = stepCount * 1.04; // 12.5" hypotenuse per 7.5" rise
    const totalStairRailingLf = stairFlights * 2 * stairRailingPerSide;
    
    calculatedRailingLf += totalStairRailingLf;

    // Use user override if provided and > 0, otherwise use calculated
    const effectiveRailingLf = (railingLf && railingLf > 0) ? railingLf : calculatedRailingLf;

    const rCost = railingCosts[railingType] || { material: 60, install: 55, spacing: 6, postCost: 95 };
    const maxSpan = rCost.spacing || 6;
    
    // Section Count: ceil(Total LF / Max Span)
    railingSectionCount = Math.ceil(effectiveRailingLf / maxSpan);
    
    // Post Count: Total Sections + 1 (+1 for every corner/stair transition)
    let corners = 4;
    if (shape === 'L-Shape') corners = 6;
    if (shape === 'Multi-corner') corners = 8;
    railingPostCount = railingSectionCount + 1 + (corners - 4) + (stairFlights > 0 ? 2 : 0);

    // Stair Multiplier: 25% increase for stair panels
    const levelRailingLf = Math.max(0, effectiveRailingLf - totalStairRailingLf);
    
    const baseMaterialCost = (levelRailingLf * rCost.material) + (totalStairRailingLf * rCost.material * 1.25);
    const baseInstallCost = (levelRailingLf * rCost.install) + (totalStairRailingLf * rCost.install * 1.25);
    
    railingMaterialCost = baseMaterialCost + (railingPostCount * rCost.postCost);
    railingInstallCost = baseInstallCost;

    // Hardware Logic: (Total Sections * 4) for brackets (2 top, 2 bottom)
    // Plus (1) Post Cap and (1) Post Skirt per post
    const bracketCost = (railingSectionCount * 4) * 8.50; // $8.50 per bracket
    const capSkirtCost = railingPostCount * 25; // $25 for cap + skirt
    railingHardwareCost = bracketCost + capSkirtCost;

    // OBC Compliance Flags
    if (height > 24) {
      railingFlags.push('OBC: Deck > 24" (600mm) - 36" high railing required.');
    }
    if (height > 71) {
      railingFlags.push('OBC: Deck > 71" (1800mm) - 42" high railing required.');
    }
    railingFlags.push('OBC: Ensure baluster spacing is < 4" (100mm) for non-climbable standards.');
  }

  // Stairs
  const riserCount = Math.ceil(height / 7.75);
  const stringerCount = stairWidth <= 36 ? 2 : (stairWidth <= 60 ? 3 : 4);
  const treadCostKey = selectedMaterial.isComposite ? 'composite' : (selectedMaterial.id === 'cedar' ? 'cedar' : 'pine');
  const stairMaterialCost = stairFlights * (riserCount * (stairTreadCosts[treadCostKey] || 24));
  const stairLaborBase = stairFlights * (riserCount / 10); // 10 steps per day base
  const stairLaborMultiplier = STAIR_LABOR_MULTIPLIER[stairType];

  // Labor Engine
  const crewDayRate = crewRates[municipality] || 1220;
  
  // Base Crew Days
  let crewDays = 0;
  crewDays += footingCount / 13;
  crewDays += area / 1000;
  
  const deckingRate = selectedMaterial.id === 'pine' ? 400 : (selectedMaterial.id === 'cedar' ? 360 : 320);
  crewDays += area / deckingRate;
  
  if (railingType !== 'None') {
    const rRate = railingType === 'Wood Picket' ? 60 : (railingType === 'Aluminum' ? 50 : (railingType === 'Cable' ? 15 : 20));
    crewDays += (railingLf * 1.10) / rRate;
  }
  
  crewDays += perimeter / 100; // Fascia
  
  // Multipliers
  let complexityMult = 1.0;
  if (shape === 'L-Shape') complexityMult *= 1.10;
  if (shape === 'Multi-corner') complexityMult *= 1.25;
  if (shape === 'Curved') complexityMult *= 1.50;
  
  if (pattern === 'Diagonal') complexityMult *= 1.20;
  if (pattern === 'Picture Frame') complexityMult *= 1.25;
  if (pattern === 'Herringbone') complexityMult *= 1.30;
  
  if (levels === 2) complexityMult *= 1.35;
  if (levels === 3) complexityMult *= 1.60;
  
  if (height > 48 && height <= 96) complexityMult *= 1.20;
  if (height > 96) complexityMult *= 1.30;
  
  if (siteType === 'Waterfront-Lakefront') complexityMult *= 1.10;
  if (siteType === 'Hillside') complexityMult *= 1.25;
  if (siteType === 'Urban Tight') complexityMult *= 1.35;
  if (siteType === 'Island-Ferry') complexityMult *= 1.75;
  
  if (buildSeason === 'Fall') complexityMult *= 1.15;
  if (buildSeason === 'Winter') complexityMult *= 1.40;
  
  if (railingType === 'Cable') complexityMult *= 1.30;
  if (railingType === 'Glass Panels') complexityMult *= 1.40;

  const breaker_crew_days = breaker_labor_hrs / 8;
  const totalCrewDays = (crewDays + stairLaborBase * stairLaborMultiplier + breaker_crew_days) * complexityMult;
  const manHours = totalCrewDays * 24;
  const calculatedLaborCost = totalCrewDays * crewDayRate;
  const finalLaborCost = customLaborCost !== undefined ? customLaborCost : calculatedLaborCost;
  
  // Calculate framing-specific labor for contractor view
  const framingLaborDays = (area / 1000) * complexityMult;
  const framingLaborCost = (framingLaborDays / totalCrewDays) * finalLaborCost;

  // Apply material markup
  const markupMult = (1 + ((materialMarkup || 0) / 100));
  const m_deckingCost = deckingCost * markupMult;
  const m_framingCost = framingCost * markupMult;
  const m_foundationCost = foundationCost * markupMult;
  const m_hardwareTotal = hardwareTotal * markupMult;
  const m_railingMaterialCost = railingMaterialCost * markupMult;
  const m_stairMaterialCost = stairMaterialCost * markupMult;
  const m_screwCost = screwCost * markupMult;
  const m_hiddenClipCost = hiddenClipCost * markupMult;
  const m_joistHangerCost = joistHangerCost * markupMult;
  const m_postAnchorCost = postAnchorCost * markupMult;
  const m_breaker_board_cost = breaker_board_cost * markupMult;
  const m_breaker_blocking_cost = breaker_blocking_cost * markupMult;

  const settingsEngineeringFee = settings?.engineeringFee || 1500;

  // Permits
  let permitFee = 0;
  if (deckType === 'Attached' || area > 108 || height > 24 || pergolaSqft > 0) {
    permitFee = permitFees[municipality] || 200;
  }
  const caFee = (siteType === 'Waterfront-Lakefront' || siteType === 'Island-Ferry') ? 560 : 0;
  let engineeringFee = 0;
  if (intendedLoad === 'Heavy' || levels >= 3 || pergolaSqft > 0 || soilCondition === 'Shallow Bedrock') {
    engineeringFee = settingsEngineeringFee;
    flags.push('Engineering Required');
  }

  let permitDesc = '';
  switch (municipality) {
    case 'Toronto': permitDesc = 'Apply via toronto.ca/building or call 311 / 416-392-2489.'; break;
    case 'Barrie': permitDesc = 'Apply via barrie.ca/building or call 705-739-4212.'; break;
    case 'Simcoe County': permitDesc = 'Apply via simcoe.ca or check local township. Call 705-726-9300.'; break;
    case 'Burlington-Oakville': permitDesc = 'Apply via burlington.ca/building (905-335-7731) or oakville.ca/building (905-845-6601).'; break;
    default: permitDesc = 'Please check your local municipal website for building permit requirements.';
  }

  // Add-ons
  const lSys = lightingSystem || { selectedItems: [], wireDistance: 0 };
  
  const selectedLightingItems = (lSys.selectedItems || []).map(item => {
    const product = INLITE_PRODUCTS.find(p => p.id === item.productId);
    if (!product) return null;
    return {
      ...product,
      qty: item.qty
    };
  }).filter((item): item is any => item !== null);

  const totalLightingMaterial = selectedLightingItems.reduce((sum, item) => sum + (item.cost || 0) * item.qty, 0);
  const totalLightingLabor = selectedLightingItems.reduce((sum, item) => sum + (item.laborCost || 0) * item.qty, 0);

  const totalLightingCost = (totalLightingMaterial * markupMult) + totalLightingLabor;

  const constructionLaborRates = LABOR_RATES_2026.construction;
  const baseLaborRate = (constructionLaborRates.standardDeckingBase + constructionLaborRates.standardDeckingMax) / 2;
  
  const constructionLaborCosts = {
    base: area * baseLaborRate,
    tieIn: deckType === 'Add-on' ? constructionLaborRates.structuralTieIn : 0,
    specialty: (pictureFrameRows === 1 ? perimeter * constructionLaborRates.specialtyFramingSingle : 0) +
               (pictureFrameRows === 2 || hasInlay ? perimeter * constructionLaborRates.specialtyFramingDouble : 0),
  };

  const totalConstructionLabor = Object.values(constructionLaborCosts).reduce((a, b) => a + b, 0);

  const addOnCosts = {
    lighting: totalLightingCost,
    bench: benchLf * 155 * markupMult,
    privacy: privacySqft * 70 * markupMult,
    drainage: hasDrainage ? area * 12 * markupMult : 0,
    demo: hasDemo ? area * 14 * markupMult : 0,
    pergola: pergolaSqft * 65 * markupMult,
    // Add-on module specific
    structuralTieIn: deckType === 'Add-on' ? (data.addOnHardwareCost || 450) * markupMult : 0,
    ledgerFlashing: deckType === 'Add-on' ? (data.addOnFlashingLf || width) * 12 * markupMult : 0,
    transitionLabor: deckType === 'Add-on' ? (data.addOnTransitionLabor || 850) : 0,
  };

  const directCost = (m_deckingCost || 0) + (m_breaker_board_cost || 0) + (m_framingCost || 0) + (m_foundationCost || 0) + (m_hardwareTotal || 0) + (m_railingMaterialCost || 0) + (m_stairMaterialCost || 0) + (totalConstructionLabor || 0) + (permitFee || 0) + (caFee || 0) + (engineeringFee || 0) + (Object.values(addOnCosts).reduce((a, b) => a + (b || 0), 0));
  const overhead = directCost * 0.18;
  const contingency = directCost * 0.10;
  const profit = (directCost + overhead + contingency) * 0.15;
  
  const total = directCost + overhead + contingency + profit;

  const costPerSqft = area > 0 ? total / area : 0;

  if (costPerSqft < 25) flags.push('Estimate may be incomplete - review inputs');
  if (costPerSqft > 200) flags.push('Estimate is high - review inputs');
  if (breaker_rows > 5) flags.push('Unusually high number of breaker rows detected. Verify deck depth input — consider using longer board lengths if available from supplier.');

  // Build Sections
  const sections: EstimateResult['sections'] = [
    {
      title: 'Permits & Professional Fees',
      icon: '📋',
      description: `${permitDesc} (Prices last verified: Feb 2026)`,
      total: permitFee + caFee + engineeringFee,
      items: [
        { name: 'Building Permit', spec: municipality, qty: 1, unit: 'ea', cost: permitFee },
        { name: 'CA Permit', spec: 'Conservation Authority', qty: caFee > 0 ? 1 : 0, unit: 'ea', cost: caFee },
        { name: 'Engineering Review', spec: 'Structural Stamp', qty: engineeringFee > 0 ? 1 : 0, unit: 'ea', cost: engineeringFee },
      ]
    },
    {
      title: 'Foundation & Footings',
      icon: '🏗',
      description: 'Includes excavation, materials, and installation of the selected foundation system.',
      total: m_foundationCost,
      items: [
        { name: footingType, spec: soilCondition, qty: footingCount, unit: 'ea', cost: m_foundationCost },
      ]
    },
    {
      title: `Structural Framing (${framingSize} Joists)`,
      icon: '🔧',
      description: `Pressure-treated pine ${framingSize} joists and beams/ledger boards.`,
      total: m_framingCost - m_breaker_blocking_cost + framingLaborCost,
      items: [
        { name: 'Joists & Beams', spec: `${framingSize} Joists`, qty: Math.ceil(totalFramingLf - breaker_blocking_lf), unit: 'lf', cost: m_framingCost - m_breaker_blocking_cost },
        { name: 'Framing Labor', spec: 'Installation', qty: Math.ceil(framingLaborDays * 24), unit: 'hrs', cost: framingLaborCost }
      ]
    },
    {
      title: 'Decking',
      icon: '🪵',
      description: 'Surface decking boards including waste factor for the selected pattern.',
      total: m_deckingCost + m_breaker_board_cost + m_breaker_blocking_cost,
      items: [
        { name: selectedMaterial.name, spec: pattern, qty: finalBoards, unit: 'boards', cost: m_deckingCost },
        ...(breaker_required ? [
          { name: `Breaker Board Rows (${breaker_rows} rows)`, spec: `${total_breaker_boards} boards × ${standard_board_length}ft — perpendicular to field, full deck width`, qty: total_breaker_boards, unit: 'boards', cost: m_breaker_board_cost },
          { name: `Breaker Row Blocking (PT 2×10)`, spec: `${breaker_rows} rows × joist bay blocking @ ${(joistSpacing / 12 - 0.1).toFixed(1)}ft each`, qty: Math.ceil(breaker_blocking_lf / 8), unit: 'pcs', cost: m_breaker_blocking_cost }
        ] : []),
      ]
    },
    {
      title: 'Hardware & Fasteners',
      icon: '🔩',
      description: 'Screws, hidden clips, joist hangers, and post anchors.',
      total: m_hardwareTotal,
      items: [
        { name: fasteningSystem === 'Face' ? 'Deck Screws' : 'Hidden Clips', spec: 'Corrosion Resistant', qty: fasteningSystem === 'Face' ? totalScrews : Math.ceil(area), unit: fasteningSystem === 'Face' ? 'pcs' : 'sqft', cost: m_screwCost + m_hiddenClipCost },
        { name: 'Joist Hangers', spec: 'LUS26/28', qty: joistHangerCost / 4.5, unit: 'ea', cost: m_joistHangerCost },
        { name: 'Post Anchors', spec: 'ABU44/66', qty: footingCount, unit: 'ea', cost: m_postAnchorCost },
      ]
    },
    {
      title: 'Railing System',
      icon: '🚧',
      description: 'Guardrails and handrails required by code or selected for aesthetics.',
      total: m_railingMaterialCost + (railingHardwareCost * markupMult),
      items: [
        { name: railingType, spec: `Kits (${railingSectionCount} × ${railingCosts[railingType]?.spacing || 6}ft)`, qty: railingSectionCount, unit: 'kits', cost: m_railingMaterialCost - (railingPostCount * (railingCosts[railingType]?.postCost || 0) * markupMult) },
        { name: 'Railing Posts', spec: 'W/ Caps & Skirts', qty: railingPostCount, unit: 'ea', cost: railingPostCount * (railingCosts[railingType]?.postCost || 0) * markupMult },
        { name: 'Railing Hardware', spec: 'Brackets (4/section) & Caps', qty: railingSectionCount * 4, unit: 'ea', cost: railingHardwareCost * markupMult },
      ].filter(item => railingType !== 'None')
    },
    {
      title: 'Labour (Construction & Build)',
      icon: '👷',
      description: 'Professional labor based on 2026 Ontario Industry Rates. Fully editable.',
      total: totalConstructionLabor,
      items: [
        { 
          name: 'Standard Decking Labour', 
          spec: 'Base framing & decking', 
          qty: area, 
          unit: 'sqft', 
          cost: constructionLaborCosts.base,
          unitPrice: 0,
          laborCost: constructionLaborCosts.base / area
        },
        ...(deckType === 'Add-on' ? [
          { 
            name: 'Structural Tie-in Labour', 
            spec: 'Siding/Ledger prep', 
            qty: 1, 
            unit: 'ls', 
            cost: constructionLaborCosts.tieIn,
            unitPrice: 0,
            laborCost: constructionLaborCosts.tieIn
          }
        ] : []),
        ...(pictureFrameRows > 0 || hasInlay ? [
          { 
            name: 'Specialty Framing Labour', 
            spec: 'Picture frames/Inlays', 
            qty: perimeter, 
            unit: 'lf', 
            cost: constructionLaborCosts.specialty,
            unitPrice: 0,
            laborCost: constructionLaborCosts.specialty / perimeter
          }
        ] : []),
      ]
    },
    {
      title: 'in-lite® Lighting System',
      icon: '💡',
      description: 'Exclusive 12V low-voltage system with professional installation.',
      total: totalLightingCost,
      items: selectedLightingItems.map(item => ({
        name: item.name,
        spec: item.category,
        qty: item.qty,
        unit: 'ea',
        cost: (item.cost * markupMult + item.laborCost) * item.qty,
        unitPrice: item.cost * markupMult,
        laborCost: item.laborCost
      }))
    },
    {
      title: 'Add-ons & Extras',
      icon: '✨',
      description: 'Optional features to enhance your outdoor living space.',
      total: Object.values(addOnCosts).reduce((a, b) => a + b, 0) - addOnCosts.lighting,
      items: [
        { name: 'Built-in Bench', spec: 'Matching Decking', qty: benchLf, unit: 'lf', cost: addOnCosts.bench },
        { name: 'Privacy Screen', spec: 'Louvered/Slatted', qty: privacySqft, unit: 'sqft', cost: addOnCosts.privacy },
        { name: 'Drainage System', spec: 'Under-deck', qty: hasDrainage ? area : 0, unit: 'sqft', cost: addOnCosts.drainage },
        { name: 'Demo & Removal', spec: 'Existing Deck', qty: hasDemo ? area : 0, unit: 'sqft', cost: addOnCosts.demo },
        { name: 'Pergola', spec: 'Wood/Aluminum', qty: pergolaSqft, unit: 'sqft', cost: addOnCosts.pergola },
        { name: 'Structural Tie-in', spec: 'Hardware to Existing', qty: deckType === 'Add-on' ? 1 : 0, unit: 'ls', cost: addOnCosts.structuralTieIn },
        { name: 'Ledger Flashing', spec: 'Connection Width', qty: deckType === 'Add-on' ? (data.addOnFlashingLf || width) : 0, unit: 'lf', cost: addOnCosts.ledgerFlashing },
        { name: 'Transition Labor', spec: 'Leveling & Siding Prep', qty: deckType === 'Add-on' ? 1 : 0, unit: 'ls', cost: addOnCosts.transitionLabor },
      ].filter(item => item.qty > 0)
    },
    {
      title: 'Overhead, Contingency & Profit',
      icon: '📊',
      description: 'Standard contractor margins for project management, risk, and business operations.',
      total: overhead + contingency + profit,
      items: [
        { name: 'Overhead', spec: '18%', qty: 1, unit: 'ls', cost: overhead },
        { name: 'Contingency', spec: '10%', qty: 1, unit: 'ls', cost: contingency },
        { name: 'Profit', spec: '15%', qty: 1, unit: 'ls', cost: profit },
      ]
    }
  ];

  // Apply custom overrides
  if (data.customOverrides) {
    sections.forEach(section => {
      section.items.forEach(item => {
        const override = data.customOverrides![item.name];
        if (override) {
          if (override.qty !== undefined) item.qty = override.qty;
          if (override.cost !== undefined) item.cost = override.cost;
        }
      });
      // Recalculate section total
      section.total = (section.items as any[]).reduce((sum: number, item: any) => sum + (item.cost || 0), 0);
    });
  }

  const finalTotal = sections.reduce((sum, s) => sum + s.total, 0);
  const finalCostPerSqft = finalTotal / area;

  return {
    total: finalTotal,
    costPerSqft: finalCostPerSqft,
    area,
    manHours,
    calculatedRailingLf,
    sections: sections.filter(s => s.total > 0),
    flags: Array.from(new Set([...flags, ...railingFlags])),
    materialList: sections.flatMap(s => s.items).map(i => ({ 
      item: i.name, 
      spec: i.spec, 
      qty: i.qty, 
      unit: i.unit, 
      cost: i.cost 
    })).filter(i => i.cost > 0),
    breakerInfo: breaker_required ? {
      required: true,
      rows: breaker_rows,
      interval: breaker_interval,
      standardLength: standard_board_length,
      positions1: breaker_positions1,
      positions2: breaker_positions2
    } : undefined
  };
}
