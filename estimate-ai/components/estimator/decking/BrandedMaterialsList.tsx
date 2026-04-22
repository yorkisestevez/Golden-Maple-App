import React, { useState, useMemo } from 'react';
import { DeckData, INLITE_PRODUCTS } from '@/lib/decking/types';

import { ChevronDown, ChevronUp, Copy, ExternalLink, Package, Wrench, Trees } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandedMaterialsListProps {
  materials: any[];
  data: DeckData;
}

interface MaterialItem {
  id: string;
  category: 'TimberTech' | 'Trex' | 'Deckorators' | 'PT Lumber' | 'Hardware';
  item: string;
  brand: string;
  product: string;
  size: string;
  coverage: string;
  qtyFormula: string;
  qtyValue: number;
  unit: string;
  supplier: string;
  url: string;
  note?: string;
}

export const BrandedMaterialsList: React.FC<BrandedMaterialsListProps> = ({ data, materials: propMaterials }) => {
  const materialsList = propMaterials;

  const [showFraming, setShowFraming] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const materials = useMemo(() => {
    const items: MaterialItem[] = [];
    const W = data.width;
    const L = data.length;
    
    const selectedMaterial = materialsList.find(m => m.id === data.deckingMaterial) || materialsList[0] || { isComposite: false, name: 'PT Pine' };
    
    const deckingSqFt = W * L;
    const perimeter = (W + L) * 2;
    const railingPerimeter = data.deckType === 'Attached' ? W + (L * 2) : perimeter;
    const deckWidth = W;
    const deckLength = L;
    const elevation = data.height; // in inches
    
    const postSpacing = 6; // ft
    const pCountW = Math.max(1, Math.round(W / postSpacing));
    const pCountL = Math.max(1, Math.round(L / postSpacing));
    
    let structPosts = (pCountW + 1) * (pCountL + 1);
    if (data.deckType === 'Attached') {
      structPosts -= (pCountW + 1);
    }
    
    const joistSpacingInches = data.joistSpacing;
    const joistCount = Math.max(1, Math.ceil((W * 12) / joistSpacingInches)) + 1;
    
    const stepCount = Math.max(0, Math.ceil(elevation / 7.5));
    const isComposite = selectedMaterial.isComposite;
    const isGrooved = data.fasteningSystem === 'Hidden';

    const getBrandInfo = (id: string) => {
      if (id.startsWith('tt_')) return { brand: 'TimberTech', category: 'TimberTech' as const, supplier: 'TimberTech.com', url: 'https://www.timbertech.com' };
      if (id.startsWith('trex_')) return { brand: 'Trex', category: 'Trex' as const, supplier: 'Trex.com', url: 'https://www.trex.com' };
      if (id.startsWith('deck_')) return { brand: 'Deckorators', category: 'Deckorators' as const, supplier: 'Deckorators.com', url: 'https://www.deckorators.com' };
      return { brand: 'TimberTech', category: 'TimberTech' as const, supplier: 'TimberTech.com', url: 'https://www.timbertech.com' };
    };

    const brandInfo = getBrandInfo(selectedMaterial.id);

    // Decking Boards
    if (isComposite) {
      items.push({
        id: 'decking_composite',
        category: brandInfo.category,
        item: 'Field Decking Boards',
        brand: brandInfo.brand,
        product: `${selectedMaterial.name} Deck Board`,
        size: '1 in x 6 in x 16 ft nominal',
        coverage: 'one 16ft board covers approx 5.94 sq ft',
        qtyFormula: `ceil((${deckingSqFt} × 1.10) / 5.94)`,
        qtyValue: Math.ceil((deckingSqFt * 1.10) / 5.94),
        unit: 'boards',
        supplier: brandInfo.supplier,
        url: brandInfo.url,
        note: isGrooved ? 'Available in grooved (for hidden fasteners)' : 'Available in square-shoulder edge'
      });
      
      items.push({
        id: 'fascia_composite',
        category: brandInfo.category,
        item: 'Fascia Boards',
        brand: brandInfo.brand,
        product: `${brandInfo.brand} Fascia Board - color matched to ${selectedMaterial.name}`,
        size: '1 in x 8 in x 16 ft nominal',
        coverage: 'one 16ft piece covers 16 linear feet',
        qtyFormula: `ceil(${railingPerimeter} / 16) + 2`,
        qtyValue: Math.ceil(railingPerimeter / 16) + 2,
        unit: 'boards',
        supplier: brandInfo.supplier,
        url: brandInfo.url
      });

      if (isGrooved) {
        items.push({
          id: 'fasteners_hidden_composite',
          category: 'Hardware',
          item: 'Hidden Fasteners',
          brand: brandInfo.brand === 'Trex' ? 'Trex Hideaway' : (brandInfo.brand === 'Deckorators' ? 'Deckorators Stowaway' : 'TimberTech CONCEALoc'),
          product: brandInfo.brand === 'Trex' ? 'Trex Hideaway Hidden Fasteners' : (brandInfo.brand === 'Deckorators' ? 'Deckorators Stowaway Hidden Fasteners' : 'TimberTech CONCEALoc Hidden Deck Clip Fasteners'),
          size: 'standard clip',
          coverage: 'approx 175 clips per 100 sq ft',
          qtyFormula: `ceil(${deckingSqFt} / 100) × 175`,
          qtyValue: Math.ceil(deckingSqFt / 100) * 175,
          unit: 'clips',
          supplier: brandInfo.supplier,
          url: brandInfo.url,
          note: 'For grooved boards only.'
        });
      } else {
        items.push({
          id: 'fasteners_cortex_composite',
          category: 'Hardware',
          item: 'Deck Screws / Hidden Fasteners',
          brand: 'FastenMaster',
          product: `FastenMaster Cortex Hidden Fastening System for ${brandInfo.brand}`,
          size: '2.5 in screw length',
          coverage: '100 sq ft pack = 350 screws + 400 plugs',
          qtyFormula: `ceil(${deckingSqFt} / 100) + 1`,
          qtyValue: Math.ceil(deckingSqFt / 100) + 1,
          unit: 'packs',
          supplier: 'FastenMaster',
          url: 'https://www.fastenmaster.com',
          note: 'Pre-drill with 7/32" bit for composite boards.'
        });
      }
    } else {
      items.push({
        id: 'decking_natural',
        category: 'PT Lumber',
        item: 'Field Decking Boards',
        brand: 'MicroPro Sienna',
        product: `MicroPro Sienna 5/4 x 6 ${selectedMaterial.name} Decking Board`,
        size: '5/4 in x 6 in nominal (actual: 1" x 5.5") in 16\' length',
        coverage: 'one 16ft board covers 6.67 sq ft',
        qtyFormula: `ceil((${deckingSqFt} × 1.10) / 6.67)`,
        qtyValue: Math.ceil((deckingSqFt * 1.10) / 6.67),
        unit: 'boards',
        supplier: 'Home Depot Canada',
        url: 'https://www.homedepot.ca/en/home/categories/building-materials/lumber-and-composites/pressure-treated-lumber.html'
      });
      
      items.push({
        id: 'fasteners_pt',
        category: 'Hardware',
        item: 'Deck Screws',
        brand: 'GRK Fasteners',
        product: 'GRK RSS Rugged Structural Screw #9 x 3 in',
        size: '#9 x 3 inch, star drive',
        coverage: 'approx 75 screws per lb',
        qtyFormula: `ceil(totalBoards × 6 / 75)`,
        qtyValue: Math.ceil((Math.ceil((deckingSqFt * 1.10) / 6.67) * 6) / 75),
        unit: 'lbs',
        supplier: 'Home Depot Canada',
        url: 'https://www.homedepot.ca/en/home/categories/building-materials/fasteners-and-connectors.html'
      });
    }

    // Framing (PT Lumber)
    items.push({
      id: 'posts_4x4',
      category: 'PT Lumber',
      item: 'Structural Posts (4x4)',
      brand: 'MicroPro Sienna',
      product: 'MicroPro Sienna 4x4x10\' Pressure Treated Post',
      size: '4 in x 4 in x 10 ft nominal (actual: 3.5" x 3.5" x 10\')',
      coverage: 'Ground contact rated (UC4B)',
      qtyFormula: `structPosts`,
      qtyValue: structPosts,
      unit: 'posts',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/product/micropro-sienna-4-inch-x-4-inch-x-10-ft-pressure-treated-post/1000790080'
    });

    if (elevation > 96) {
      items.push({
        id: 'posts_6x6',
        category: 'PT Lumber',
        item: 'Structural Posts (6x6)',
        brand: 'MicroPro Sienna',
        product: 'MicroPro Sienna 6x6x10\' Pressure Treated Post',
        size: '6 in x 6 in x 10 ft nominal (actual: 5.5" x 5.5" x 10\')',
        coverage: 'Ground contact rated (UC4B)',
        qtyFormula: `structPosts`,
        qtyValue: structPosts,
        unit: 'posts',
        supplier: 'Home Depot Canada',
        url: 'https://www.homedepot.ca/en/home/categories/building-materials/lumber-and-composites/pressure-treated-lumber.html'
      });
    }

    items.push({
      id: 'joists_2x10',
      category: 'PT Lumber',
      item: 'Joists (2x10)',
      brand: 'MicroPro Sienna',
      product: 'MicroPro Sienna 2x10 Pressure Treated Joist',
      size: '2 in x 10 in nominal (actual: 1.5" x 9.25")',
      coverage: 'Spans up to 15\'5" at 16" OC',
      qtyFormula: `joistCount`,
      qtyValue: joistCount,
      unit: 'pieces',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/en/home/categories/building-materials/lumber-and-composites/pressure-treated-lumber.html'
    });
    
    items.push({
      id: 'rim_beams',
      category: 'PT Lumber',
      item: 'Rim Beams / Ledger (2x12)',
      brand: 'MicroPro Sienna',
      product: 'MicroPro Sienna 2x12 Pressure Treated Rim Board',
      size: '2x12 nominal',
      coverage: '16ft lengths',
      qtyFormula: `ceil(${perimeter} / 16)`,
      qtyValue: Math.ceil(perimeter / 16),
      unit: 'pieces',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/en/home/categories/building-materials/lumber-and-composites/pressure-treated-lumber.html'
    });

    // Hardware
    items.push({
      id: 'joist_hangers',
      category: 'Hardware',
      item: 'Joist Hangers',
      brand: 'Simpson Strong-Tie',
      product: 'Simpson Strong-Tie LUS210 2x10 Joist Hanger',
      size: 'fits 2x10 or 2x12 joist',
      coverage: '18-gauge galvanized',
      qtyFormula: `(joistCount × 2)`,
      qtyValue: joistCount * 2,
      unit: 'hangers',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/en/home/categories/building-materials/fasteners-and-connectors/joist-hangers-and-connectors.html'
    });

    items.push({
      id: 'hanger_screws',
      category: 'Hardware',
      item: 'Hanger Screws',
      brand: 'Simpson Strong-Tie',
      product: 'Simpson Strong-Tie SD9112 1.5" Structural Connector Screw',
      size: '#9 x 1.5 in (box of 100)',
      coverage: '10 screws per hanger avg',
      qtyFormula: `ceil((${joistCount * 2} × 10) / 100)`,
      qtyValue: Math.ceil((joistCount * 2 * 10) / 100),
      unit: 'boxes',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/en/home/categories/building-materials/fasteners-and-connectors.html'
    });

    items.push({
      id: 'concrete_tubes',
      category: 'Hardware',
      item: 'Concrete Tube Forms',
      brand: 'Sonotube',
      product: 'Sonotube 10-inch Concrete Form Tube',
      size: '10 in diameter x 4 ft length',
      coverage: 'one tube form per post footing',
      qtyFormula: `structPosts`,
      qtyValue: structPosts,
      unit: 'tubes',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/en/home/categories/building-materials/concrete-cement-and-masonry/concrete-forms.html'
    });

    items.push({
      id: 'concrete',
      category: 'Hardware',
      item: 'Concrete (footings)',
      brand: 'Quikrete',
      product: 'Quikrete 5000 High Early Strength Concrete Mix',
      size: '80 lb bag',
      coverage: '4 bags per footing',
      qtyFormula: `structPosts × 4`,
      qtyValue: structPosts * 4,
      unit: 'bags',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/en/home/categories/building-materials/concrete-cement-and-masonry/concrete.html'
    });

    items.push({
      id: 'post_bases',
      category: 'Hardware',
      item: 'Post Base Connectors',
      brand: 'Simpson Strong-Tie',
      product: 'Simpson Strong-Tie ABA44 4x4 Post Base',
      size: 'fits 4x4 or 6x6 post',
      coverage: 'hot-dipped galvanized',
      qtyFormula: `structPosts`,
      qtyValue: structPosts,
      unit: 'bases',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/en/home/categories/building-materials/fasteners-and-connectors/post-bases-and-caps.html'
    });

    items.push({
      id: 'flashing_tape',
      category: 'Hardware',
      item: 'Flashing Tape',
      brand: 'Grace',
      product: 'Grace Vycor Plus Self-Adhering Flashing Tape',
      size: '4 inch wide x 75 foot roll',
      coverage: 'one roll = 75 linear feet',
      qtyFormula: `ceil(${deckWidth} / 75) + 1`,
      qtyValue: Math.ceil(deckWidth / 75) + 1,
      unit: 'rolls',
      supplier: 'Home Depot Canada',
      url: 'https://www.homedepot.ca/en/home/categories/building-materials/roofing/underlayments-and-accessories.html'
    });

    items.push({
      id: 'joist_tape',
      category: 'Hardware',
      item: 'Joist Tape',
      brand: 'Cortex / TimberTech',
      product: 'Trident Joist Tape',
      size: '1.5 inch wide x 50 foot roll',
      coverage: 'one roll per 50 linear feet of joist',
      qtyFormula: `ceil((${joistCount} × ${deckLength}) / 50)`,
      qtyValue: Math.ceil((joistCount * deckLength) / 50),
      unit: 'rolls',
      supplier: 'The Deck Store',
      url: 'https://www.thedeckstoreonline.com'
    });

    // Stairs
    if (stepCount > 0) {
      items.push({
        id: 'stair_stringers',
        category: 'PT Lumber',
        item: 'Stair Stringers',
        brand: 'MicroPro Sienna',
        product: 'MicroPro Sienna 2x12 Pressure Treated Stair Stringer',
        size: '2 in x 12 in nominal',
        coverage: 'lengths to match stair run',
        qtyFormula: `3 stringers per stair section`,
        qtyValue: 3,
        unit: 'stringers',
        supplier: 'Home Depot Canada',
        url: 'https://www.homedepot.ca/en/home/categories/building-materials/lumber-and-composites/pressure-treated-lumber.html'
      });

      if (isComposite) {
        items.push({
          id: 'stair_treads_composite',
          category: brandInfo.category,
          item: 'Stair Treads',
          brand: brandInfo.brand,
          product: `${brandInfo.brand} Stair Tread - color matched to ${selectedMaterial.name}`,
          size: '1"x12"x48" or 6"x16ft cut to width',
          coverage: '2 boards per tread',
          qtyFormula: `${stepCount} × 2`,
          qtyValue: stepCount * 2,
          unit: 'boards',
          supplier: brandInfo.supplier,
          url: brandInfo.url
        });
      } else {
        items.push({
          id: 'stair_treads_natural',
          category: 'PT Lumber',
          item: 'Stair Treads',
          brand: 'MicroPro Sienna',
          product: `MicroPro Sienna 2x6 ${selectedMaterial.name} Board`,
          size: '2 boards per tread',
          coverage: 'full deck width',
          qtyFormula: `${stepCount} × 2`,
          qtyValue: stepCount * 2,
          unit: 'boards',
          supplier: 'Home Depot Canada',
          url: 'https://www.homedepot.ca'
        });
      }
    }

    // Railing
    if (data.railingType !== 'None') {
      const RAILING_COSTS_DEFAULT: Record<string, any> = {'Wood Picket':{spacing:6},'Aluminum':{spacing:6},'Cable':{spacing:4},'Glass Panels':{spacing:3},'Trex Select':{spacing:8},'Trex Transcend':{spacing:8},'Fortress AL13':{spacing:8},'TT Classic':{spacing:8},'TT Impression':{spacing:8}};
      const rCost = RAILING_COSTS_DEFAULT[data.railingType as string];
      const maxSpan = rCost?.spacing || 6;
      const sectionCount = Math.ceil(railingPerimeter / maxSpan);
      
      let corners = 4;
      if (data.shape === 'L-Shape') corners = 6;
      if (data.shape === 'Multi-corner') corners = 8;
      const postCount = sectionCount + 1 + (corners - 4) + (stepCount > 0 ? 2 : 0);

      const getRailingBrand = (type: string) => {
        if (type.includes('Trex')) return { brand: 'Trex', supplier: 'Trex.com', url: 'https://www.trex.com' };
        if (type.includes('Fortress')) return { brand: 'Fortress', supplier: 'FortressBP.com', url: 'https://www.fortressbp.com' };
        if (type.includes('TT')) return { brand: 'TimberTech', supplier: 'TimberTech.com', url: 'https://www.timbertech.com' };
        return { brand: 'Generic', supplier: 'Home Depot', url: 'https://www.homedepot.ca' };
      };

      const rBrand = getRailingBrand(data.railingType);

      items.push({
        id: 'railing_kits',
        category: rBrand.brand as any,
        item: 'Railing Panel Kits',
        brand: rBrand.brand,
        product: `${data.railingType} Railing Kit`,
        size: `${maxSpan}ft section`,
        coverage: 'per linear foot',
        qtyFormula: `ceil(${railingPerimeter} / ${maxSpan})`,
        qtyValue: sectionCount,
        unit: 'kits',
        supplier: rBrand.supplier,
        url: rBrand.url
      });

      items.push({
        id: 'railing_posts',
        category: rBrand.brand as any,
        item: 'Railing Posts',
        brand: rBrand.brand,
        product: `${rBrand.brand} Structural Post / Sleeve`,
        size: '36" or 42" height',
        coverage: 'one per section end',
        qtyFormula: `sectionCount + 1 + corners`,
        qtyValue: postCount,
        unit: 'posts',
        supplier: rBrand.supplier,
        url: rBrand.url
      });

      items.push({
        id: 'railing_caps_skirts',
        category: rBrand.brand as any,
        item: 'Post Caps & Skirts',
        brand: rBrand.brand,
        product: `${rBrand.brand} Post Cap and Base Skirt`,
        size: 'matched to post',
        coverage: 'one set per post',
        qtyFormula: `postCount`,
        qtyValue: postCount,
        unit: 'sets',
        supplier: rBrand.supplier,
        url: rBrand.url
      });

      if (stepCount > 0) {
        items.push({
          id: 'railing_stair_hardware',
          category: 'Hardware',
          item: 'Stair Railing Brackets',
          brand: rBrand.brand,
          product: `${rBrand.brand} Stair Mounting Bracket Kit`,
          size: 'adjustable angle',
          coverage: '4 per stair section',
          qtyFormula: `stairFlights × 4`,
          qtyValue: data.stairFlights * 4,
          unit: 'kits',
          supplier: rBrand.supplier,
          url: rBrand.url
        });
      }
    }

    if (data.deckType === 'Add-on') {
      items.push({
        id: 'structural_tie_in',
        category: 'Hardware',
        item: 'Structural Tie-in',
        brand: 'FastenMaster',
        product: 'FastenMaster ThruLok / SDWS Structural Screws',
        size: '6.25" or 8" length',
        coverage: '2 per joist connection',
        qtyFormula: `joistCount × 2`,
        qtyValue: joistCount * 2,
        unit: 'screws',
        supplier: 'The Deck Store',
        url: 'https://www.thedeckstoreonline.com'
      });

      items.push({
        id: 'ledger_flashing',
        category: 'Hardware',
        item: 'Ledger Flashing',
        brand: 'Generic',
        product: 'Aluminum or Vinyl Ledger Flashing',
        size: '10ft lengths',
        coverage: 'full connection width',
        qtyFormula: `ceil(${data.addOnFlashingLf || data.width} / 10)`,
        qtyValue: Math.ceil((data.addOnFlashingLf || data.width) / 10),
        unit: 'pcs',
        supplier: 'Home Depot Canada',
        url: 'https://www.homedepot.ca'
      });
    }

    // in-lite® Lighting System (selectedItems API)
    const lSys = data.lightingSystem;
    const totalFixtures = lSys.selectedItems.reduce((sum: number, item: any) => sum + item.qty, 0);

    if (totalFixtures > 0) {
      lSys.selectedItems.forEach((item: any, idx: number) => {
        const product = INLITE_PRODUCTS.find((p: any) => p.id === item.productId);
        if (!product) return;
        items.push({
          id: `light_${item.productId}`,
          category: 'Hardware',
          item: product.category,
          brand: 'in-lite®',
          product: product.name,
          size: product.description || '',
          coverage: product.category,
          qtyFormula: `selectedItems[${idx}].qty`,
          qtyValue: item.qty,
          unit: 'ea',
          supplier: 'in-lite® Outdoor Lighting',
          url: 'https://in-lite.com',
        });
      });
    }

    return items;
  }, [data]);

  const stats = useMemo(() => {
    return {
      timberTech: materials.filter(m => m.category === 'TimberTech').length,
      trex: materials.filter(m => m.category === 'Trex').length,
      deckorators: materials.filter(m => m.category === 'Deckorators').length,
      fortress: materials.filter(m => (m.category as string) === 'Fortress').length,
      ptLumber: materials.filter(m => m.category === 'PT Lumber').length,
      hardware: materials.filter(m => m.category === 'Hardware').length,
    };
  }, [materials]);

  const exportList = () => {
    const header = 'ITEM | BRAND | PRODUCT | SIZE | QTY | SUPPLIER | URL\n';
    const rows = materials.map(m => 
      `${m.item} | ${m.brand} | ${m.product} | ${m.size} | ${m.qtyValue} ${m.unit} | ${m.supplier} | ${m.url}`
    ).join('\n');
    navigator.clipboard.writeText(header + rows);
    alert('Materials list copied to clipboard!');
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'TimberTech': return 'bg-[#1B4F8A] text-white';
      case 'Trex': return 'bg-[#5B8C31] text-white';
      case 'Deckorators': return 'bg-[#222222] text-white';
      case 'Fortress': return 'bg-[#C41230] text-white';
      case 'PT Lumber': return 'bg-[#2D5A1B] text-white';
      case 'Hardware': return 'bg-[#4B5563] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getBadgeIcon = (category: string) => {
    switch (category) {
      case 'TimberTech': return <Package size={14} />;
      case 'PT Lumber': return <Trees size={14} />;
      case 'Hardware': return <Wrench size={14} />;
      default: return <Package size={14} />;
    }
  };

  const visibleMaterials = showFraming 
    ? materials 
    : materials.filter(m => ['TimberTech', 'Trex', 'Deckorators', 'Fortress'].includes(m.category) || m.id.startsWith('railing') || m.id.startsWith('fascia') || m.id.startsWith('decking'));

  return (
    <div className="card-slate overflow-hidden mt-12 rounded-3xl border-2 border-black/5 bg-white">
      <div className="p-6 border-b border-black/5 bg-brand-accent/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-brand-text-primary">
            Branded Materials List
          </h3>
          <p className="text-xs text-brand-text-secondary/60 mt-1">
            Exact products, sizes, and quantities for your build.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFraming(!showFraming)}
            className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs"
          >
            {showFraming ? 'Hide Framing' : 'Show Framing'}
          </button>
          <button 
            onClick={exportList}
            className="btn-primary py-1.5 px-3 flex items-center gap-2 text-xs"
          >
            <Copy size={14} /> Export List
          </button>
        </div>
      </div>

      <div className="bg-brand-accent/5 px-6 py-3 flex items-center gap-6 border-b border-black/5 text-xs font-bold text-brand-text-secondary/60 overflow-x-auto no-scrollbar">
        {stats.timberTech > 0 && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-[#1B4F8A]"></div>
            {stats.timberTech} TimberTech Items
          </div>
        )}
        {stats.trex > 0 && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-[#5B8C31]"></div>
            {stats.trex} Trex Items
          </div>
        )}
        {stats.deckorators > 0 && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-[#222222]"></div>
            {stats.deckorators} Deckorators Items
          </div>
        )}
        {stats.fortress > 0 && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-[#C41230]"></div>
            {stats.fortress} Fortress Items
          </div>
        )}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="w-3 h-3 rounded-full bg-[#2D5A1B]"></div>
          {stats.ptLumber} PT Lumber Items
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="w-3 h-3 rounded-full bg-[#4B5563]"></div>
          {stats.hardware} Hardware Items
        </div>
      </div>

      <div className="p-6 space-y-4">
        {visibleMaterials.map((item) => {
          const isExpanded = expandedItems[item.id];
          return (
            <div key={item.id} className="border border-black/5 rounded-xl overflow-hidden bg-white shadow-sm hover:border-brand-gold/30 transition-colors">
              <div 
                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer select-none gap-4"
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                  <div className={cn("px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0", getBadgeColor(item.category))}>
                    {getBadgeIcon(item.category)}
                    {item.brand}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-brand-text-primary text-sm truncate">{item.product}</h4>
                    <p className="text-xs text-brand-text-secondary/60 truncate">{item.size}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="font-bold text-xl text-brand-text-primary number-font">
                      {item.qtyValue} <span className="text-xs text-brand-text-secondary/60 font-normal">{item.unit}</span>
                    </div>
                    <div className="text-[10px] text-brand-text-secondary/40 font-mono mt-0.5">
                      {item.qtyFormula} = {item.qtyValue} {item.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-brand-text-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-brand-gold transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Buy Online <ExternalLink size={14} />
                    </a>
                    <div className="text-brand-text-secondary/40">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-black/5 bg-brand-accent/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block mb-1">Item Name</span>
                      <p className="text-xs text-brand-text-primary">{item.item}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block mb-1">Coverage</span>
                      <p className="text-xs text-brand-text-primary">{item.coverage}</p>
                    </div>
                    {item.note && (
                      <div className="bg-brand-gold/10 text-brand-gold p-2 rounded-lg text-xs">
                        <strong>Note:</strong> {item.note}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 flex flex-col justify-end">
                    <div>
                      <p className="text-[10px] text-brand-text-secondary/40 mt-2">
                        Supplier: {item.supplier}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-brand-accent/10 border-t border-black/5 text-xs text-brand-text-secondary/60 italic space-y-1">
        <p><strong>★ Primary supplier for this contractor: Carr Landscape Depot.</strong> Contact Carr Landscape Depot for local pricing and availability on all TimberTech and pressure treated products before ordering online.</p>
        <p>For pricing contact Carr Landscape Depot or visit the product links above. Prices vary by region and current lumber market.</p>
        <p>Quantities include standard waste factors. Always verify with supplier before ordering.</p>
      </div>
    </div>
  );
};
