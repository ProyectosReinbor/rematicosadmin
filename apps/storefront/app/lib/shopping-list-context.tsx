'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type ListItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;

  selectedOptions: Record<string, string>;
};

type ShoppingListContextType = {
  items: ListItem[];
  addItem: (item: Omit<ListItem, 'id'>) => void;
  removeItem: (id: string) => void;
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
            parsed
              .filter(
                (item) =>
                  item &&
                  typeof item.productId === 'string' &&
                  typeof item.productName === 'string',
              )
              .map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                productSlug: item.productSlug,
                productImage: item.productImage,
                selectedOptions: item.selectedOptions || {},
              })),
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
          i.productId === item.productId && key(i.selectedOptions) === key(item.selectedOptions),
      );
      if (existing) return prev;
      return [...prev, { ...item, id: generateId() }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearList = useCallback(() => setItems([]), []);

  return (
    <ShoppingListContext.Provider
      value={{ items, addItem, removeItem, clearList, totalItems: items.length }}
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
