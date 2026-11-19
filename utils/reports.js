import { EXPIRING_DAYS } from '../constants/theme';
import { formatLong, startOfToday } from './date';
import { formatDateTime, money, qtyText } from './format';
import { writeTextFile } from './files';

const DAY_MS = 86400000;
const val = (i) => (i.quantity || 0) * (i.costPerUnit || 0);

export const REPORT_KINDS = [
  { key: 'expiry', label: 'Daily expiry sheet', icon: 'calendar' },
  { key: 'waste', label: 'Weekly waste summary', icon: 'flame' },
  { key: 'stock', label: 'Full stock sheet', icon: 'cube' },
];

export function buildReport(kind, { items, records }) {
  if (kind === 'expiry') {
    const list = items.filter((i) => i.daysLeft <= EXPIRING_DAYS).sort((a, b) => a.daysLeft - b.daysLeft);
    const risk = list.reduce((s, i) => s + val(i), 0);
    return {
      title: 'Daily Expiry Sheet',
      subtitle: `${formatLong(startOfToday())} · items expiring within ${EXPIRING_DAYS} days`,
      summary: [{ label: 'Items to use', value: String(list.length) }, { label: 'Value at risk', value: money(risk) }],
      columns: ['Item', 'Qty', 'Expires', 'Status', 'Value at risk', 'Allergens'],
      rows: list.map((i) => [
        i.name, qtyText(i.quantity, i.unit), i.expiryDate,
        i.daysLeft < 0 ? 'Expired' : i.daysLeft === 0 ? 'Today' : `${i.daysLeft}d left`, money(val(i)), (i.allergens || []).join(', ') || '-',
      ]),
      file: 'daily-expiry-sheet',
    };
  }
  if (kind === 'waste') {
    const since = Date.now() - 7 * DAY_MS;
    const week = records.filter((r) => r.ts >= since);
    const waste = week.filter((r) => r.type === 'waste').sort((a, b) => b.ts - a.ts);
    const used = week.filter((r) => r.type === 'used');
    const lost = waste.reduce((s, r) => s + r.cost, 0);
    const byReason = {};
    waste.forEach((r) => { byReason[r.reason || 'Other'] = (byReason[r.reason || 'Other'] || 0) + r.cost; });
    return {
      title: 'Weekly Waste Summary',
      subtitle: `Last 7 days, up to ${formatLong(startOfToday())}`,
      summary: [
        { label: 'Total lost', value: money(lost) },
        { label: 'Waste entries', value: String(waste.length) },
        { label: 'Used (value)', value: money(used.reduce((s, r) => s + r.cost, 0)) },
        ...Object.entries(byReason).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: `Lost to ${k.toLowerCase()}`, value: money(v) })),
      ],
      columns: ['When', 'Item', 'Qty', 'Reason', 'Cost', 'Staff'],
      rows: waste.map((r) => [formatDateTime(r.ts), r.name, qtyText(r.qty, r.unit), r.reason || '-', money(r.cost), r.user]),
      file: 'weekly-waste-summary',
    };
  }
  const list = [...items].sort((a, b) => a.name.localeCompare(b.name));
  return {
    title: 'Stock Sheet',
    subtitle: `${formatLong(startOfToday())} · everything in storage`,
    summary: [{ label: 'Items', value: String(list.length) }, { label: 'Total stock value', value: money(list.reduce((s, i) => s + val(i), 0)) }],
    columns: ['Item', 'Category', 'Qty', 'Cost / unit', 'Value', 'Expires', 'Allergens'],
    rows: list.map((i) => [
      i.name, i.category, qtyText(i.quantity, i.unit), money(i.costPerUnit || 0), money(val(i)), i.expiryDate, (i.allergens || []).join(', ') || '-',
    ]),
    file: 'stock-sheet',
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function toHTML(r) {
  const head = r.columns.map((c) => `<th>${esc(c)}</th>`).join('');
  const body = r.rows.length
    ? r.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${r.columns.length}" style="text-align:center;color:#6b7c72">Nothing to report.</td></tr>`;
  const sum = r.summary.map((s) => `<div class="s"><div class="l">${esc(s.label)}</div><div class="v">${esc(s.value)}</div></div>`).join('');
  return `<html><head><meta charset="utf-8"/><style>
body{font-family:-apple-system,Helvetica,Arial,sans-serif;padding:28px;color:#10201a}
h1{margin:0;font-size:24px;color:#0f3d22}.sub{color:#6b7c72;margin:4px 0 18px}
.sums{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}.s{background:#f1f5f1;border-radius:10px;padding:10px 14px}
.l{font-size:11px;color:#6b7c72;text-transform:uppercase;letter-spacing:.5px}.v{font-size:18px;font-weight:800}
table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0f3d22;color:#fff;text-align:left;padding:8px}
td{padding:7px 8px;border-bottom:1px solid #e3ebe4}tr:nth-child(even) td{background:#f8faf8}
.f{margin-top:18px;font-size:10px;color:#9aa9a0}</style></head><body>
<h1>FreshTrack · ${esc(r.title)}</h1><div class="sub">${esc(r.subtitle)}</div>
<div class="sums">${sum}</div><table><tr>${head}</tr>${body}</table>
<div class="f">Generated ${esc(formatDateTime(Date.now()))}</div></body></html>`;
}

const csvCell = (c) => `"${String(c).replace(/"/g, '""')}"`;

export function toCSV(r) {
  const lines = [csvCell(r.title), csvCell(r.subtitle), ''];
  r.summary.forEach((s) => lines.push(`${csvCell(s.label)},${csvCell(s.value)}`));
  lines.push('', r.columns.map(csvCell).join(','));
  r.rows.forEach((row) => lines.push(row.map(csvCell).join(',')));
  return '\uFEFF' + lines.join('\n'); // BOM keeps the peso sign readable in Excel
}

function need(name, pkgs) {
  const e = new Error(`MISSING:${pkgs}`);
  e.pkg = name;
  return e;
}

// Needs: npx expo install expo-print expo-sharing expo-file-system
export async function exportPDF(r) {
  let Print, Sharing;
  try { Print = require('expo-print'); Sharing = require('expo-sharing'); } catch (e) { throw need('pdf', 'expo-print expo-sharing'); }
  const { uri } = await Print.printToFileAsync({ html: toHTML(r) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: r.title, UTI: 'com.adobe.pdf' });
  }
}

export async function printReport(r) {
  let Print;
  try { Print = require('expo-print'); } catch (e) { throw need('print', 'expo-print'); }
  await Print.printAsync({ html: toHTML(r) });
}

export async function exportCSV(r) {
  let Sharing;
  try { Sharing = require('expo-sharing'); } catch (e) { throw need('csv', 'expo-sharing expo-file-system'); }
  const stamp = new Date().toISOString().slice(0, 10);
  const uri = await writeTextFile(`${r.file}-${stamp}.csv`, toCSV(r));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: r.title, UTI: 'public.comma-separated-values-text' });
  }
}
