export const ALLERGENS = ['Dairy', 'Eggs', 'Gluten', 'Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Soy', 'Sesame'];

const KEYWORDS = {
  Dairy: ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'yoghurt', 'parmesan', 'mozzarella', 'cheddar', 'ghee', 'custard', 'mascarpone', 'ricotta', 'feta', 'gouda', 'brie', 'creme', 'whey', 'gruyere', 'camembert'],
  Eggs: ['egg', 'mayonnaise', 'meringue', 'aioli'],
  Gluten: ['flour', 'bread', 'pasta', 'spaghetti', 'noodle', 'wheat', 'barley', 'rye', 'couscous', 'breadcrumb', 'biscuit', 'pastry', 'dough', 'macaroni', 'lasagne', 'tortilla', 'pita', 'bulgur', 'semolina', 'cake', 'crouton', 'filo', 'puff'],
  Nuts: ['almond', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'pecan', 'macadamia', 'pine nut', 'brazil nut', 'praline', 'marzipan'],
  Peanuts: ['peanut'],
  Shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'mussel', 'clam', 'oyster', 'scallop', 'squid', 'crayfish', 'langoustine', 'shellfish', 'calamari'],
  Fish: ['salmon', 'tuna', 'cod', 'haddock', 'anchov', 'sardine', 'mackerel', 'trout', 'fish', 'herring', 'bass', 'snapper', 'tilapia', 'halibut', 'sole'],
  Soy: ['soy', 'tofu', 'edamame', 'miso', 'tempeh'],
  Sesame: ['sesame', 'tahini'],
};

// Words that contain an allergen keyword but are not that allergen.
const NOT_DAIRY_OR_EGG = /eggplant|butternut|buttercup|peanut butter|nut butter|cocoa butter|shea butter|coconut milk|almond milk|soy milk|oat milk|rice milk|coconut cream/g;

export function detectAllergens(name) {
  const n = (name || '').toLowerCase();
  const cleaned = n.replace(NOT_DAIRY_OR_EGG, ' ');
  return ALLERGENS.filter((a) => KEYWORDS[a].some((k) => (a === 'Dairy' || a === 'Eggs' ? cleaned : n).includes(k)));
}

export function detectAll(names) {
  const set = new Set();
  (names || []).forEach((n) => detectAllergens(n).forEach((a) => set.add(a)));
  return ALLERGENS.filter((a) => set.has(a));
}
