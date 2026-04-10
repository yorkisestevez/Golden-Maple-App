
import { CatalogItem } from '../../types';
import { STORAGE_KEYS, getJSON, setJSON } from '../storage';

export const searchCatalog = (
  query: string,
  filters?: { vendorId?: string; department?: string; brand?: string; favoritesOnly?: boolean }
): CatalogItem[] => {
  const items = getJSON<CatalogItem[]>(STORAGE_KEYS.CATALOG, []);
  const normalizedQuery = query.toLowerCase().trim();

  return items
    .filter(item => {
      if (filters?.vendorId && item.vendorId !== filters.vendorId) return false;
      if (filters?.department && item.department !== filters.department) return false;
      if (filters?.brand && item.brand !== filters.brand) return false;
      // Fixed: favorite status is nested under visibility
      if (filters?.favoritesOnly && !item.visibility.isFavorite) return false;

      if (!normalizedQuery) return true;

      const searchableString = [
        item.name,
        item.brand,
        item.categoryId,
        item.department,
        item.vendorSku,
        ...(item.synonyms || [])
      ].join(' ').toLowerCase();

      return searchableString.includes(normalizedQuery);
    })
    .sort((a, b) => {
      // Fixed: Access favorite status via visibility property
      if (a.visibility.isFavorite && !b.visibility.isFavorite) return -1;
      if (!a.visibility.isFavorite && b.visibility.isFavorite) return 1;
      
      // Then by usage count (popularity boost)
      // Fixed: usage statistics are nested under usage property
      return (b.usage?.useCount || 0) - (a.usage?.useCount || 0);
    });
};

export const getCatalogItemById = (itemId: string): CatalogItem | undefined => {
  const items = getJSON<CatalogItem[]>(STORAGE_KEYS.CATALOG, []);
  return items.find(i => i.id === itemId);
};

export const recordCatalogUse = (itemId: string, context: 'po' | 'estimate'): void => {
  const items = getJSON<CatalogItem[]>(STORAGE_KEYS.CATALOG, []);
  const updated = items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        usage: {
          lastUsedAt: new Date().toISOString(),
          // Fixed: usage statistics are nested under usage property
          useCount: (item.usage?.useCount || 0) + 1
        }
      };
    }
    return item;
  });
  setJSON(STORAGE_KEYS.CATALOG, updated);
};
