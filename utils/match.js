// Loose ingredient-name matching ("Salmon Fillet" ~ "Salmon", "Carrots" ~ "Carrot").
export const norm = (s) => (s || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();

const singular = (w) =>
  w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.endsWith('oes') ? w.slice(0, -2) : w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w;

export const keyOf = (s) => norm(s).split(' ').map(singular).join(' ');

export function sameIngredient(a, b) {
  const x = keyOf(a), y = keyOf(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const short = x.length < y.length ? x : y;
  const long = x.length < y.length ? y : x;
  return short.length >= 4 && ` ${long} `.includes(` ${short} `);
}

// Best TheMealDB catalog entry for a stock item name (or null).
export function bestCatalogMatch(name, catalog) {
  let best = null;
  const k = keyOf(name);
  for (const ing of catalog || []) {
    if (!sameIngredient(name, ing.name)) continue;
    const diff = Math.abs(keyOf(ing.name).length - k.length);
    if (!best || diff < best.diff) best = { ing, diff };
    if (diff === 0) break;
  }
  return best ? best.ing : null;
}

export function dishStock(dish, items) {
  const total = (dish.ingredients || []).length;
  const have = (dish.ingredients || []).filter((ing) => items.some((i) => i.quantity > 0 && sameIngredient(i.name, ing.name))).length;
  return { have, total };
}
