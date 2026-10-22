import React, { createContext, useContext, useState } from 'react';

// In-memory store shared by every route (no AsyncStorage).
// Data lives as long as the app is running.
const RecipeContext = createContext(null);

const INITIAL_RECIPES = [
  {
    id: '1',
    name: 'Spaghetti Bolognese',
    category: 'Italian',
    servings: 4,
    description: 'Classic beef and tomato sauce simmered slowly and tossed with spaghetti.',
    image: 'https://via.placeholder.com/600x400/4CAF50/FFFFFF.png?text=Spaghetti+Bolognese',
  },
  {
    id: '2',
    name: 'Pancakes',
    category: 'Breakfast',
    servings: 2,
    description: 'Fluffy stacked pancakes served with butter and maple syrup.',
    image: 'https://via.placeholder.com/600x400/FFC107/FFFFFF.png?text=Pancakes',
  },
  {
    id: '3',
    name: 'Grilled Chicken',
    category: 'Main Course',
    servings: 3,
    description: 'Marinated chicken breast grilled until juicy, served with vegetables.',
    image: 'https://via.placeholder.com/600x400/FF7043/FFFFFF.png?text=Grilled+Chicken',
  },
  {
    id: '4',
    name: 'Caesar Salad',
    category: 'Salad',
    servings: 2,
    description: 'Crisp romaine lettuce with croutons, parmesan, and Caesar dressing.',
    image: 'https://via.placeholder.com/600x400/8BC34A/FFFFFF.png?text=Caesar+Salad',
  },
  {
    id: '5',
    name: 'Chocolate Cake',
    category: 'Dessert',
    servings: 8,
    description: 'Rich and moist chocolate cake layered with chocolate frosting.',
    image: 'https://via.placeholder.com/600x400/6D4C41/FFFFFF.png?text=Chocolate+Cake',
  },
];

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [account, setAccount] = useState(null);

  const addRecipe = (recipe) => setRecipes((current) => [recipe, ...current]);

  const deleteRecipe = (id) => setRecipes((current) => current.filter((r) => r.id !== id));

  const updateRecipe = (id, changes) =>
    setRecipes((current) => current.map((r) => (r.id === id ? { ...r, ...changes } : r)));

  const registerAccount = (user) => setAccount(user);

  return (
    <RecipeContext.Provider
      value={{ recipes, addRecipe, deleteRecipe, updateRecipe, account, registerAccount }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be used inside <RecipeProvider>');
  return ctx;
}
