
import { CartLine, CatalogItem } from '../../types';
import { STORAGE_KEYS, safeGetJSON, safeSetJSON, uid, nowISO } from '../storage';
import { recordUsage } from '../catalog/usage';

export const getCart = () => safeGetJSON<CartLine[]>(STORAGE_KEYS.ESTIMATE_CART, []);

export const addToCart = (item: CatalogItem, qty: number, tier: string) => {
  const cart = getCart();
  const unitPrice = item.tierPrices[tier] || 0;
  const newLine: CartLine = {
    id: uid('CART'),
    addedAtISO: nowISO(),
    catalogItemId: item.id,
    vendorId: item.vendorId,
    pricebookId: item.pricebookId,
    name: item.name,
    um: item.unitOfMeasure,
    tier,
    qty,
    unitPrice,
    extended: qty * unitPrice
  };
  safeSetJSON(STORAGE_KEYS.ESTIMATE_CART, [newLine, ...cart]);
  recordUsage(item.id);
};

export const removeFromCart = (lineId: string) => {
  const cart = getCart();
  safeSetJSON(STORAGE_KEYS.ESTIMATE_CART, cart.filter(l => l.id !== lineId));
};

export const updateCartLine = (lineId: string, updates: Partial<CartLine>) => {
  const cart = getCart();
  const updated = cart.map(l => {
    if (l.id === lineId) {
      const newLine = { ...l, ...updates };
      if (updates.qty !== undefined || updates.unitPrice !== undefined) {
        newLine.extended = newLine.qty * newLine.unitPrice;
      }
      return newLine;
    }
    return l;
  });
  safeSetJSON(STORAGE_KEYS.ESTIMATE_CART, updated);
};

export const reorderCart = (fromIndex: number, toIndex: number) => {
  const cart = getCart();
  const result = Array.from(cart);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  safeSetJSON(STORAGE_KEYS.ESTIMATE_CART, result);
};

export const computeCartSubtotal = () => {
  return getCart().reduce((sum, line) => sum + line.extended, 0);
};
