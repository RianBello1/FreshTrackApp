import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, makeShadow } from '../constants/theme';
import { loadJSON, saveJSON } from '../utils/storage';

const KEY = 'freshtrack.theme.v1';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState('system'); // 'system' | 'light' | 'dark'

  useEffect(() => { loadJSON(KEY, 'system').then(setModeState); }, []);

  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';

  const value = useMemo(() => {
    const setMode = (m) => { setModeState(m); saveJSON(KEY, m); };
    return {
      mode, isDark, setMode,
      colors: isDark ? darkColors : lightColors,
      shadow: makeShadow(isDark),
      toggle: () => setMode(isDark ? 'light' : 'dark'),
    };
  }, [mode, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Build styles from a factory({ colors, shadow, isDark }); rebuilt only when the theme flips.
export function useThemedStyles(factory) {
  const t = useTheme();
  return useMemo(() => factory(t), [t.isDark]);
}
