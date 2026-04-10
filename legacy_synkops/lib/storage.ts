
export const STORAGE_KEYS = {
  VENDORS: 'synkops_vendors_v1',
  PRICEBOOKS: 'synkops_pricebooks_v1',
  CATALOG: 'synkops_catalog_v1',
  CATEGORIES: 'synkops_catalog_categories_v1',
  USAGE: 'synkops_catalog_usage_v1',
  FAVORITES: 'synkops_catalog_favorites_v1',
  ESTIMATE_CART: 'synkops_estimate_cart_v1',
  IMPORT_JOBS: 'synkops_catalog_import_jobs_v1',
  SETTINGS: 'synkops_settings_v1',
  PROPOSALS: 'synkops_proposals_v1',
  CONTACTS: 'synkops_contacts_v1',
  PRODUCTION_RATES: 'synkops_production_rates_v1',
  ASSEMBLIES: 'synkops_assemblies_v1',
  INVOICES: 'synkops_invoices_v1',
  COST_CODES: 'synkops_cost_codes_v1',
  EMPLOYEES: 'synkops_employees_v1'
};

export const safeGetJSON = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Storage Error: Failed to parse ${key}`, e);
    return fallback;
  }
};

export const safeSetJSON = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Storage Error: Failed to save ${key}`, e);
  }
};

export const getJSON = safeGetJSON;
export const setJSON = safeSetJSON;

export const uid = (prefix: string = 'ID'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};

export const generateId = uid;
export const nowISO = () => new Date().toISOString();

export const parseNumberSafe = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return 0;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};
