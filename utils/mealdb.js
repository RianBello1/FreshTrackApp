// TheMealDB (https://www.themealdb.com/api.php). "1" is the free test key; swap in a supporter key if you have one.
const API_KEY = '1';
const BASE = `https://www.themealdb.com/api/json/v1/${API_KEY}`;

async function get(path) {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`TheMealDB returned ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Unexpected response from TheMealDB');
  }
}

const arr = (x) => (x && Array.isArray(x.meals) ? x.meals : []);

export const ingredientImage = (name, size = 'small') =>
  `https://www.themealdb.com/images/ingredients/${encodeURIComponent((name || '').trim().replace(/\s+/g, '_'))}-${size}.png`;

export async function fetchIngredientList() {
  const meals = arr(await get('list.php?i=list'));
  return meals
    .map((m) => ({ id: String(m.idIngredient), name: m.strIngredient, type: m.strType || null }))
    .filter((m) => m.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listCategories() {
  return arr(await get('list.php?c=list')).map((m) => m.strCategory).filter(Boolean);
}

const brief = (m) => ({ id: String(m.idMeal), name: m.strMeal, image: m.strMealThumb, category: m.strCategory || null });

export async function searchMeals(q) {
  return arr(await get(`search.php?s=${encodeURIComponent(q)}`)).map(brief);
}

export async function filterByCategory(c) {
  return arr(await get(`filter.php?c=${encodeURIComponent(c)}`)).map(brief);
}

const filterCache = new Map();
export function filterByIngredient(name) {
  const key = (name || '').trim().toLowerCase();
  if (!filterCache.has(key)) {
    const p = get(`filter.php?i=${encodeURIComponent(key.replace(/\s+/g, '_'))}`)
      .then((r) => arr(r).map(brief))
      .catch((e) => { filterCache.delete(key); throw e; });
    filterCache.set(key, p);
  }
  return filterCache.get(key);
}

export async function lookupMeal(id) {
  const m = arr(await get(`lookup.php?i=${encodeURIComponent(id)}`))[0];
  if (!m) return null;
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = (m[`strIngredient${i}`] || '').trim();
    if (name) ingredients.push({ name, measure: (m[`strMeasure${i}`] || '').trim() });
  }
  return {
    mealId: String(m.idMeal), name: m.strMeal, category: m.strCategory || 'General', area: m.strArea || '',
    instructions: m.strInstructions || '', image: m.strMealThumb || '', youtube: m.strYoutube || '', ingredients,
  };
}
