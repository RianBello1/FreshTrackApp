// Date helpers. Expiry dates are stored as "YYYY-MM-DD" (local time).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86400000;
const pad = (n) => String(n).padStart(2, '0');

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function addDays(n) {
  const t = startOfToday();
  t.setDate(t.getDate() + n);
  return t;
}

export function addMonths(n) {
  const t = startOfToday();
  t.setMonth(t.getMonth() + n);
  return t;
}

// Returns a Date only for a real calendar date in YYYY-MM-DD form, else null.
export function parseISODate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s || '').trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (y < 2000 || y > 2100) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function daysUntil(s) {
  const dt = parseISODate(s);
  if (!dt) return null;
  return Math.round((dt - startOfToday()) / DAY_MS);
}

export function formatLong(dt) {
  return `${DAYS[dt.getDay()]}, ${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

export function describeDays(n) {
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n} days` : `${Math.abs(n)} days ago`;
}

// Keeps digits only and inserts the dashes: 20261130 -> 2026-11-30
export function maskDate(text) {
  const digits = (text || '').replace(/\D/g, '').slice(0, 8);
  let out = digits.slice(0, 4);
  if (digits.length > 4) out += '-' + digits.slice(4, 6);
  if (digits.length > 6) out += '-' + digits.slice(6, 8);
  return out;
}

// status: 'empty' | 'partial' | 'invalid' | 'valid'
export function validateExpiry(value) {
  const v = (value || '').trim();
  if (!v) return { status: 'empty' };
  if (v.length < 10) return { status: 'partial' };
  const date = parseISODate(v);
  if (!date) return { status: 'invalid' };
  const days = Math.round((date - startOfToday()) / DAY_MS);
  return { status: 'valid', date, days, label: formatLong(date), when: describeDays(days) };
}
