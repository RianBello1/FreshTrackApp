import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth, usePermissions } from './AuthContext';
import { useActivity } from './ActivityContext';
import { loadJSON, saveJSON } from '../utils/storage';
import { addDays, daysUntil, toISO } from '../utils/date';
import { detectAllergens } from '../utils/allergens';
import { money } from '../utils/format';
import { EXPIRING_DAYS } from '../constants/theme';

const InventoryContext = createContext(null);

export const TRASH_DAYS = 30;
export const WASTE_REASONS = ['Expired', 'Spoiled', 'Dropped', 'Over-prepped', 'Returned'];
export const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack'];
const DAY_MS = 86400000;
const ITEMS_KEY = 'freshtrack.items.v1';
const TRASH_KEY = 'freshtrack.trash.v1';
const RECORDS_KEY = 'freshtrack.records.v1';

// Starter stock for a fine-dining kitchen. Dates are relative to the first launch.
function seedItems() {
  const d = (n) => toISO(addDays(n));
  const mk = (id, name, quantity, unit, category, costPerUnit, days) => ({
    id, name, quantity, unit, category, costPerUnit, expiryDate: d(days), allergens: detectAllergens(name), image: '',
  });
  return [
    mk('1', 'Salmon Fillet', 6, 'kg', 'Seafood', 1450, 1),
    mk('2', 'Heavy Cream', 5, 'L', 'Dairy', 420, 2),
    mk('3', 'Beef Tenderloin', 8, 'kg', 'Protein', 2200, 3),
    mk('4', 'King Prawns', 4, 'kg', 'Seafood', 1800, 2),
    mk('5', 'Asparagus', 3, 'kg', 'Vegetable', 520, 1),
    mk('6', 'Carrots', 5, 'kg', 'Vegetable', 90, 5),
    mk('7', 'Butter', 10, 'kg', 'Dairy', 650, 30),
    mk('8', 'Free-range Eggs', 60, 'pcs', 'Dairy', 12, 14),
    mk('9', 'Parmesan', 3, 'kg', 'Dairy', 1900, 45),
  ];
}

// Older saved items didn't have these fields.
const normalizeItem = (i) => ({ unit: 'pcs', costPerUnit: 0, allergens: [], image: '', ...i });
const stillInTrash = (t, now) => now - t.deletedAt < TRASH_DAYS * DAY_MS;
const round2 = (n) => Math.round(Number(n) * 100) / 100;
const denied = { ok: false, error: 'You do not have permission to do that.' };

export function InventoryProvider({ children }) {
  const perms = usePermissions();
  const { currentUser } = useAuth();
  const { log } = useActivity();
  const permsRef = useRef(perms); permsRef.current = perms;
  const logRef = useRef(log); logRef.current = log;
  const userRef = useRef(currentUser); userRef.current = currentUser;

  const [rawItems, setRawItems] = useState([]);
  const [rawTrash, setRawTrash] = useState([]);
  const [records, setRecords] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(Date.now());

  const itemsRef = useRef(rawItems); itemsRef.current = rawItems;
  const trashRef = useRef(rawTrash); trashRef.current = rawTrash;

  useEffect(() => {
    let alive = true;
    (async () => {
      const storedItems = await loadJSON(ITEMS_KEY, null);
      const storedTrash = await loadJSON(TRASH_KEY, []);
      const storedRecords = await loadJSON(RECORDS_KEY, []);
      if (!alive) return;
      const t = Date.now();
      setRawItems((storedItems ?? seedItems()).map(normalizeItem));
      setRawTrash(storedTrash.filter((x) => stillInTrash(x, t)).map(normalizeItem));
      setRecords(storedRecords);
      setNow(t);
      setHydrated(true);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => { if (hydrated) saveJSON(ITEMS_KEY, rawItems); }, [rawItems, hydrated]);
  useEffect(() => { if (hydrated) saveJSON(TRASH_KEY, rawTrash); }, [rawTrash, hydrated]);
  useEffect(() => { if (hydrated) saveJSON(RECORDS_KEY, records); }, [records, hydrated]);

  const purgeExpired = useCallback(() => {
    const t = Date.now();
    setNow(t);
    setRawTrash((cur) => {
      const next = cur.filter((x) => stillInTrash(x, t));
      return next.length === cur.length ? cur : next;
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') purgeExpired(); });
    const timer = setInterval(purgeExpired, 60 * 60 * 1000);
    return () => { sub.remove(); clearInterval(timer); };
  }, [purgeExpired]);

  const items = useMemo(
    () => rawItems.map((i) => { const d = daysUntil(i.expiryDate); return { ...i, daysLeft: d === null ? 7 : d }; }),
    [rawItems, now]
  );

  const trash = useMemo(
    () => rawTrash.filter((t) => stillInTrash(t, now)).map((t) => ({
      ...t,
      daysLeft: daysUntil(t.expiryDate) ?? 7,
      purgeInDays: Math.max(0, Math.ceil((t.deletedAt + TRASH_DAYS * DAY_MS - now) / DAY_MS)),
      deletedDaysAgo: Math.floor((now - t.deletedAt) / DAY_MS),
    })),
    [rawTrash, now]
  );

  const stats = useMemo(() => {
    let stockValue = 0, expiringValue = 0, expiringCount = 0;
    items.forEach((i) => {
      const v = (i.quantity || 0) * (i.costPerUnit || 0);
      stockValue += v;
      if (i.daysLeft <= EXPIRING_DAYS) { expiringValue += v; expiringCount++; }
    });
    const weekAgo = now - 7 * DAY_MS;
    const week = records.filter((r) => r.ts >= weekAgo);
    return {
      stockValue, expiringValue, expiringCount,
      weeklyWaste: week.filter((r) => r.type === 'waste').reduce((s, r) => s + r.cost, 0),
      weeklyUsed: week.filter((r) => r.type === 'used').reduce((s, r) => s + r.cost, 0),
    };
  }, [items, records, now]);

  const addItem = (item) => {
    if (!permsRef.current.edit) return denied;
    const { daysLeft, ...rest } = item;
    setRawItems((c) => [normalizeItem(rest), ...c]);
    logRef.current({ action: 'add', target: rest.name, detail: `${rest.quantity} ${rest.unit || ''} · ${money(rest.costPerUnit || 0)}/unit`.trim() });
    return { ok: true };
  };

  const updateItem = (id, changes) => {
    if (!permsRef.current.edit) return denied;
    const old = itemsRef.current.find((i) => i.id === id);
    setRawItems((c) => c.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    if (old) {
      const changed = Object.keys(changes).filter((k) => JSON.stringify(changes[k]) !== JSON.stringify(old[k]));
      logRef.current({ action: 'edit', target: changes.name || old.name, detail: changed.length ? `Changed ${changed.join(', ')}` : 'Saved' });
    }
    return { ok: true };
  };

  // "Delete" moves an item to the trash.
  const deleteItem = useCallback((id) => {
    if (!permsRef.current.trash) return denied;
    const found = itemsRef.current.find((i) => i.id === id);
    if (!found) return { ok: false, error: 'Item not found' };
    setRawItems((c) => c.filter((i) => i.id !== id));
    setRawTrash((c) => [{ ...found, deletedAt: Date.now() }, ...c]);
    logRef.current({ action: 'delete', target: found.name, detail: 'Moved to trash' });
    return { ok: true };
  }, []);

  const restoreItems = useCallback((ids) => {
    if (!permsRef.current.trash) return denied;
    const set = new Set(ids);
    const restoring = trashRef.current.filter((t) => set.has(t.id));
    setRawTrash((c) => c.filter((t) => !set.has(t.id)));
    setRawItems((c) => [...restoring.map(({ deletedAt, ...rest }) => rest), ...c]);
    restoring.forEach((t) => logRef.current({ action: 'restore', target: t.name, detail: 'Restored from trash' }));
    return { ok: true };
  }, []);

  const purgeItems = useCallback((ids) => {
    if (!permsRef.current.trash) return denied;
    const set = new Set(ids);
    const gone = trashRef.current.filter((t) => set.has(t.id));
    setRawTrash((c) => c.filter((t) => !set.has(t.id)));
    gone.forEach((t) => logRef.current({ action: 'purge', target: t.name, detail: 'Deleted forever' }));
    return { ok: true };
  }, []);

  // type: 'used' (any role) or 'waste' (needs the waste permission).
  const adjust = useCallback((id, qty, type, reason) => {
    if (type === 'waste' && !permsRef.current.waste) return denied;
    const item = itemsRef.current.find((i) => i.id === id);
    if (!item) return { ok: false, error: 'Item not found' };
    const q = round2(qty);
    if (!(q > 0) || q > item.quantity + 1e-9) return { ok: false, error: 'Invalid quantity' };
    const remaining = round2(item.quantity - q);
    const cost = round2(q * (item.costPerUnit || 0));
    const rec = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ts: Date.now(), type,
      itemId: id, name: item.name, qty: q, unit: item.unit, cost, reason: reason || null,
      user: (userRef.current && userRef.current.fullName) || 'Unknown',
    };
    setRecords((c) => [rec, ...c].slice(0, 2000));
    setRawItems((c) => (remaining <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, quantity: remaining } : i))));
    logRef.current({
      action: type === 'used' ? 'use' : 'waste', target: item.name,
      detail: `${q} ${item.unit || ''}${reason ? ` · ${reason}` : ''}${type === 'waste' ? ` · lost ${money(cost)}` : ''}`.trim(),
    });
    return { ok: true, removed: remaining <= 0 };
  }, []);

  const consumeItem = useCallback((id, qty) => adjust(id, qty, 'used'), [adjust]);
  const wasteItem = useCallback((id, qty, reason) => adjust(id, qty, 'waste', reason), [adjust]);

  return (
    <InventoryContext.Provider
      value={{
        items, trash, records, stats, hydrated,
        addItem, updateItem, deleteItem, restoreItems, purgeItems, consumeItem, wasteItem, purgeExpired,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
