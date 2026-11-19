import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchIngredientList } from '../utils/mealdb';
import { loadJSON, saveJSON } from '../utils/storage';

const KEY = 'freshtrack.ingredients.v1';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const IngredientsContext = createContext(null);

// Loads the TheMealDB ingredient catalog as soon as the app starts (cached for offline use).
export function IngredientsProvider({ children }) {
  const [ingredients, setIngredients] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');

  const load = useCallback(async (force = false) => {
    const cached = await loadJSON(KEY, null);
    const hasCache = cached && Array.isArray(cached.list) && cached.list.length > 0;
    if (hasCache) {
      setIngredients(cached.list);
      setStatus('ready');
      if (!force && Date.now() - cached.ts < MAX_AGE) return;
    } else {
      setStatus('loading');
    }
    try {
      const list = await fetchIngredientList();
      if (list.length) {
        setIngredients(list);
        setStatus('ready');
        setError('');
        saveJSON(KEY, { ts: Date.now(), list });
      } else if (!hasCache) {
        setStatus('error');
        setError('TheMealDB returned no ingredients.');
      }
    } catch (e) {
      if (!hasCache) {
        setStatus('error');
        setError(String((e && e.message) || e));
      }
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Suggestions: names that start with the text first, then names that contain it.
  const suggest = useCallback(
    (q, limit = 6) => {
      const s = (q || '').trim().toLowerCase();
      if (!s) return [];
      const starts = [], contains = [];
      for (const ing of ingredients) {
        const n = ing.name.toLowerCase();
        if (n.startsWith(s)) starts.push(ing);
        else if (n.includes(s)) contains.push(ing);
        if (starts.length >= limit) break;
      }
      return [...starts, ...contains].slice(0, limit);
    },
    [ingredients]
  );

  return (
    <IngredientsContext.Provider value={{ ingredients, status, error, count: ingredients.length, suggest, reload: () => load(true) }}>
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  return useContext(IngredientsContext);
}
