'use client';

import { normalizeQuantity } from './quantity';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type ListItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  unit: string;
  selectedOptions: Record<string, string>;
  quantity: number;
};

type ShoppingListContextType = {
  items: ListItem[];
  addItem: (item: Omit<ListItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearList: () => void;
  totalItems: number;
};

const ShoppingListContext = createContext<ShoppingListContextType | null>(null);

const STORAGE_KEY = 'rematicos-shopping-list';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed))
          setItems(
            parsed.filter(
              (item) =>
                item &&
                typeof item.productId === 'string' &&
                typeof item.unit === 'string' &&
                Number.isFinite(item.quantity) &&
                item.quantity > 0,
            ),
          );
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items, loaded]);

  const addItem = useCallback((item: Omit<ListItem, 'id'>) => {
    setItems((prev) => {
      const key = (options: Record<string, string>) =>
        JSON.stringify(Object.entries(options).sort(([a], [b]) => a.localeCompare(b)));
      const existing = prev.find(
        (i) =>
          i.productId === item.productId &&
          i.unit === item.unit &&
          key(i.selectedOptions) === key(item.selectedOptions),
      );
      if (existing)
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: normalizeQuantity(i.quantity + item.quantity, i.unit) }
            : i,
        );
      return [
        ...prev,
        { ...item, quantity: normalizeQuantity(item.quantity, item.unit), id: generateId() },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: normalizeQuantity(quantity, i.unit) } : i)),
    );
  }, []);

  const clearList = useCallback(() => setItems([]), []);

  return (
    <ShoppingListContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearList, totalItems: items.length }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error('useShoppingList must be used within ShoppingListProvider');
  return ctx;
}
