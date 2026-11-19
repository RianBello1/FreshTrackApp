import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { ActivityProvider } from '../context/ActivityContext';
import { IngredientsProvider } from '../context/IngredientsContext';
import { InventoryProvider } from '../context/InventoryContext';
import { MenuProvider } from '../context/MenuContext';

function Shell() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ActivityProvider>
          {/* Ingredient catalog starts loading from TheMealDB as soon as the app opens */}
          <IngredientsProvider>
            <InventoryProvider>
              <MenuProvider>
                <Shell />
              </MenuProvider>
            </InventoryProvider>
          </IngredientsProvider>
        </ActivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
