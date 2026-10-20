import React, { createContext, useContext, useState } from 'react';

// In-memory store shared by every route (replaces AsyncStorage).
// Data lives as long as the app is running.
const InventoryContext = createContext(null);

const INITIAL_ITEMS = [
  { id: '1', name: 'Carrots', quantity: 1, category: 'Vegetable', expiryDate: '2026-05-09', daysLeft: 0, description: 'Fresh orange carrots stored in the pantry. Best used in soups, stews, or eaten raw as a snack.' },
  { id: '2', name: 'Apples', quantity: 3, category: 'Fruit', expiryDate: '2026-05-11', daysLeft: 2, description: 'Crisp apples kept at room temperature. Great for snacking, baking, or adding to salads.' },
  { id: '3', name: 'Meat', quantity: 2, category: 'Protein', expiryDate: '2026-06-10', daysLeft: 30, description: 'Packaged meat kept in the freezer. Thaw in the refrigerator before cooking.' },
  { id: '4', name: 'Milk', quantity: 1, category: 'Dairy', expiryDate: '2026-05-16', daysLeft: 7, description: 'Whole milk stored in the refrigerator. Shake before pouring and keep tightly sealed.' },
  { id: '5', name: 'Eggs', quantity: 12, category: 'Dairy', expiryDate: '2026-05-30', daysLeft: 21, description: 'A dozen eggs stored in the refrigerator. Keep in their original carton to preserve freshness.' },
];

export function InventoryProvider({ children }) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [account, setAccount] = useState(null);

  const addItem = (item) => setItems((current) => [item, ...current]);
  const deleteItem = (id) => setItems((current) => current.filter((i) => i.id !== id));
  const updateItem = (id, changes) =>
    setItems((current) => current.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  const registerAccount = (user) => setAccount(user);

  return (
    <InventoryContext.Provider value={{ items, addItem, deleteItem, updateItem, account, registerAccount }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside <InventoryProvider>');
  return ctx;
}
