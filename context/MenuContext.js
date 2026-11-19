import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePermissions } from './AuthContext';
import { useActivity } from './ActivityContext';
import { detectAll } from '../utils/allergens';
import { loadJSON, saveJSON } from '../utils/storage';

const KEY = 'freshtrack.menu.v1';
const MenuContext = createContext(null);

// Dish: { id, source: 'mealdb'|'custom', mealId, name, category, area, image, instructions,
//         ingredients: [{ name, measure }], allergens: [], servings, enabled, createdAt }
export function MenuProvider({ children }) {
  const perms = usePermissions();
  const { log } = useActivity();
  const permsRef = useRef(perms); permsRef.current = perms;
  const logRef = useRef(log); logRef.current = log;

  const [dishes, setDishes] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const dishesRef = useRef(dishes); dishesRef.current = dishes;

  useEffect(() => { loadJSON(KEY, []).then((d) => { setDishes(d); setHydrated(true); }); }, []);
  useEffect(() => { if (hydrated) saveJSON(KEY, dishes); }, [dishes, hydrated]);

  const addDish = useCallback((dish) => {
    if (!permsRef.current.menu) return { ok: false, error: 'You do not have permission to edit the menu.' };
    const ingredients = dish.ingredients || [];
    const full = {
      servings: 1, enabled: true, instructions: '', area: '', image: '', ...dish,
      id: `${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
      ingredients,
      allergens: dish.allergens && dish.allergens.length ? dish.allergens : detectAll(ingredients.map((i) => i.name)),
      createdAt: Date.now(),
    };
    setDishes((c) => [full, ...c]);
    logRef.current({ action: 'dish', target: full.name, detail: 'Added to menu' });
    return { ok: true, dish: full };
  }, []);

  const toggleDish = useCallback((id) => {
    if (!permsRef.current.menu) return;
    const d = dishesRef.current.find((x) => x.id === id);
    if (!d) return;
    setDishes((c) => c.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
    logRef.current({ action: 'menu', target: d.name, detail: d.enabled ? 'Removed from service' : 'Now being served' });
  }, []);

  const removeDish = useCallback((id) => {
    if (!permsRef.current.menu) return;
    const d = dishesRef.current.find((x) => x.id === id);
    if (!d) return;
    setDishes((c) => c.filter((x) => x.id !== id));
    logRef.current({ action: 'dish', target: d.name, detail: 'Removed from dish list' });
  }, []);

  return <MenuContext.Provider value={{ dishes, addDish, toggleDish, removeDish }}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  return useContext(MenuContext);
}
