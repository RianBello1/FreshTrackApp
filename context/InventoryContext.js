import React, { createContext, useContext, useState } from 'react';

// Simple in-memory store (no AsyncStorage, no backend).
const InventoryContext = createContext(null);

const INITIAL_ITEMS = [
  { id: '1', name: 'Carrots', quantity: 1, category: 'Vegetable', expiryDate: '2026-05-09', daysLeft: 0, image: 'https://via.placeholder.com/600x400/FF7043/FFFFFF.png?text=Carrots' },
  { id: '2', name: 'Apples', quantity: 3, category: 'Fruit', expiryDate: '2026-05-11', daysLeft: 2, image: 'https://via.placeholder.com/600x400/E53935/FFFFFF.png?text=Apples' },
  { id: '3', name: 'Meat', quantity: 2, category: 'Protein', expiryDate: '2026-06-10', daysLeft: 30, image: 'https://via.placeholder.com/600x400/8D6E63/FFFFFF.png?text=Meat' },
  { id: '4', name: 'Milk', quantity: 1, category: 'Dairy', expiryDate: '2026-05-16', daysLeft: 7, image: 'https://via.placeholder.com/600x400/42A5F5/FFFFFF.png?text=Milk' },
  { id: '5', name: 'Eggs', quantity: 12, category: 'Dairy', expiryDate: '2026-05-30', daysLeft: 21, image: 'https://via.placeholder.com/600x400/FFC107/FFFFFF.png?text=Eggs' },
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
  return useContext(InventoryContext);
}
