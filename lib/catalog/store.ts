
import { Vendor, Pricebook, CatalogCategory, CatalogItem, UMNormalized } from '../../types';
import { STORAGE_KEYS, safeGetJSON, safeSetJSON, uid, nowISO } from '../storage';

export const listVendors = () => safeGetJSON<Vendor[]>(STORAGE_KEYS.VENDORS, []);

// Fix: updated listCategories to optionally filter by vendorId as requested by components
export const listCategories = (vendorId?: string) => {
  let all = safeGetJSON<CatalogCategory[]>(STORAGE_KEYS.CATEGORIES, []);
  if (vendorId) {
    all = all.filter(c => !c.vendorId || c.vendorId === vendorId);
  }
  return all.sort((a, b) => a.order - b.order);
};

// Fix: added missing listItems export
export const listItems = (filters?: { vendorId?: string; categoryId?: string }) => {
  const all = safeGetJSON<CatalogItem[]>(STORAGE_KEYS.CATALOG, []);
  return all.filter(i => {
    if (filters?.vendorId && i.vendorId !== filters.vendorId) return false;
    if (filters?.categoryId && i.categoryId !== filters.categoryId) return false;
    return true;
  });
};

// Fix: added missing getCategoryPath export
export const getCategoryPath = (catId: string): string => {
  const categories = safeGetJSON<CatalogCategory[]>(STORAGE_KEYS.CATEGORIES, []);
  const cat = categories.find(c => c.id === catId);
  if (!cat) return '';
  if (!cat.parentId) return cat.name;
  return `${getCategoryPath(cat.parentId)} > ${cat.name}`;
};

export const findOrCreateCategoryByPath = (path: string): string => {
  const parts = path.split('>').map(p => p.trim());
  let categories = listCategories();
  let parentId: string | undefined = undefined;
  let finalId = '';

  for (const part of parts) {
    let cat = categories.find(c => c.name.toLowerCase() === part.toLowerCase() && c.parentId === parentId);
    if (!cat) {
      const newId = uid('CAT');
      cat = {
        id: newId,
        name: part,
        parentId,
        order: categories.length,
        categoryType: 'Materials',
        tags: []
      };
      categories.push(cat);
      safeSetJSON(STORAGE_KEYS.CATEGORIES, categories);
    }
    parentId = cat.id;
    finalId = cat.id;
  }
  return finalId;
};

export const normalizeUnit = (unitStr: string): UMNormalized => {
  const u = unitStr.toUpperCase().trim();
  if (['EA', 'EACH', 'PC', 'PIECE'].includes(u)) return 'EA';
  if (['SQFT', 'SF', 'SQ FT', 'SQUARE FEET'].includes(u)) return 'SQFT';
  if (['LNFT', 'LF', 'LIN FT', 'LINEAR FEET'].includes(u)) return 'LNFT';
  if (['TON', 'TONNE'].includes(u)) return 'TON';
  if (['YD', 'YARD', 'CY'].includes(u)) return 'YD';
  if (['BAG'].includes(u)) return 'BAG';
  if (['PALLET', 'PAL'].includes(u)) return 'PALLET';
  if (['HOUR', 'HR'].includes(u)) return 'HOUR';
  if (['TRIP', 'LOAD'].includes(u)) return 'TRIP';
  return 'OTHER';
};

export const buildSearchableText = (item: Partial<CatalogItem>) => {
  return [
    item.name,
    item.brand,
    item.unitOfMeasure,
    item.packInfoText,
    ...(item.tags || []),
    ...(item.synonyms || [])
  ].filter(Boolean).join(' ').toLowerCase();
};
