const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function money(n) {
  const v = Number(n) || 0;
  const [i, d] = Math.abs(v).toFixed(2).split('.');
  return `${v < 0 ? '-' : ''}₱${i.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${d}`;
}

export function qtyText(qty, unit) {
  const n = Math.round((Number(qty) || 0) * 100) / 100;
  return `${n}${unit ? ' ' + unit : ''}`;
}

export function formatDateTime(ts) {
  const d = new Date(ts);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

export function timeAgo(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDateTime(ts).split(' · ')[0];
}
