import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { loadJSON, saveJSON } from '../utils/storage';

const KEY = 'freshtrack.activity.v1';
const MAX = 500;
const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { loadJSON(KEY, []).then((e) => { setEntries(e); setHydrated(true); }); }, []);
  useEffect(() => { if (hydrated) saveJSON(KEY, entries); }, [entries, hydrated]);

  // action: add | edit | delete | restore | purge | use | waste | menu | dish | role
  const log = useCallback(
    ({ action, target, detail }) => {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ts: Date.now(),
        user: (currentUser && currentUser.fullName) || 'Unknown',
        email: (currentUser && currentUser.email) || '',
        role: (currentUser && currentUser.role) || 'cook',
        action, target: target || '', detail: detail || '',
      };
      setEntries((c) => [entry, ...c].slice(0, MAX));
    },
    [currentUser]
  );

  return <ActivityContext.Provider value={{ entries, log }}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  return useContext(ActivityContext);
}
