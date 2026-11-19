import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

const AuthContext = createContext(null);
const ACCOUNTS_KEY = 'freshtrack.accounts.v1';

export const ROLES = ['manager', 'chef', 'cook'];
export const ROLE_LABEL = { manager: 'Manager', chef: 'Chef', cook: 'Cook' };

const FULL = { edit: true, trash: true, costs: true, waste: true, menu: true, reports: true, log: true };
const PERMS = {
  manager: { ...FULL, staff: true },
  chef: { ...FULL, staff: false },
  cook: { edit: false, trash: false, costs: false, waste: false, menu: false, reports: false, log: false, staff: false },
};
export const permissionsFor = (role) => PERMS[role] || PERMS.cook;

// Built-in account, always available and never stored.
const ADMIN = { fullName: 'Admin', email: 'admin123', role: 'manager', isAdmin: true };
const publicUser = ({ fullName, email, role }) => ({ fullName, email, role: role || 'cook' });

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const accountsRef = useRef([]);
  const loadedRef = useRef(null);

  useEffect(() => {
    loadedRef.current = loadJSON(ACCOUNTS_KEY, []).then((list) => {
      const fixed = list.map((a) => ({ role: 'cook', ...a })); // older accounts had no role
      accountsRef.current = fixed;
      setStaff(fixed.map(publicUser));
      return fixed;
    });
  }, []);

  const ensureLoaded = async () => {
    if (loadedRef.current) await loadedRef.current;
    return accountsRef.current;
  };

  const persist = async (next) => {
    accountsRef.current = next;
    setStaff(next.map(publicUser));
    await saveJSON(ACCOUNTS_KEY, next);
  };

  const register = async ({ fullName, email, password }) => {
    const list = await ensureLoaded();
    const e = email.trim().toLowerCase();
    if (e === ADMIN.email || list.some((a) => a.email === e)) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    const user = { fullName: fullName.trim(), email: e, password, role: 'cook', createdAt: Date.now() };
    await persist([...list, user]);
    setCurrentUser(publicUser(user));
    return { ok: true, role: 'cook' };
  };

  const login = async (identifier, password) => {
    const id = identifier.trim().toLowerCase();
    if (id === 'admin123' && password === 'admin123') {
      setCurrentUser(ADMIN);
      return { ok: true };
    }
    const list = await ensureLoaded();
    const found = list.find((a) => a.email === id && a.password === password);
    if (!found) return { ok: false, error: 'Invalid username/email or password.' };
    setCurrentUser(publicUser(found));
    return { ok: true };
  };

  const logout = () => setCurrentUser(null);

  // Managers only. Returns { ok, error }.
  const setRole = async (email, role) => {
    if (!currentUser || currentUser.role !== 'manager') return { ok: false, error: 'Only managers can change roles.' };
    if (!ROLES.includes(role)) return { ok: false, error: 'Unknown role.' };
    if (email === currentUser.email) return { ok: false, error: "You can't change your own role." };
    const list = await ensureLoaded();
    await persist(list.map((a) => (a.email === email ? { ...a, role } : a)));
    return { ok: true };
  };

  return (
    <AuthContext.Provider value={{ currentUser, staff, register, login, logout, setRole }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function usePermissions() {
  const { currentUser } = useAuth();
  return permissionsFor(currentUser && currentUser.role);
}
