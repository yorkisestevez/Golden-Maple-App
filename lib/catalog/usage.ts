
import { STORAGE_KEYS, safeGetJSON, safeSetJSON, nowISO } from '../storage';

export const isFavorite = (itemId: string) => {
  const favs = safeGetJSON<string[]>(STORAGE_KEYS.FAVORITES, []);
  return favs.includes(itemId);
};

export const toggleFavorite = (itemId: string) => {
  const favs = safeGetJSON<string[]>(STORAGE_KEYS.FAVORITES, []);
  const updated = favs.includes(itemId) ? favs.filter(id => id !== itemId) : [...favs, itemId];
  safeSetJSON(STORAGE_KEYS.FAVORITES, updated);
};

export const recordUsage = (itemId: string) => {
  const usage = safeGetJSON<Record<string, { count: number, lastUsed: string }>>(STORAGE_KEYS.USAGE, {});
  const current = usage[itemId] || { count: 0, lastUsed: '' };
  usage[itemId] = { count: current.count + 1, lastUsed: nowISO() };
  safeSetJSON(STORAGE_KEYS.USAGE, usage);
};

export const getUsageStats = () => safeGetJSON<Record<string, { count: number, lastUsed: string }>>(STORAGE_KEYS.USAGE, {});
