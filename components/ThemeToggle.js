import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

// Sun/moon button. Long-press to go back to "follow the phone's setting".
export default function ThemeToggle({ style }) {
  const { isDark, toggle, setMode } = useTheme();
  return (
    <Pressable
      onPress={toggle}
      onLongPress={() => setMode('system')}
      style={({ pressed }) => [{ width: 42, height: 42, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.6 }, style]}
    >
      <Ionicons name={isDark ? 'sunny' : 'moon'} size={19} color="#fff" />
    </Pressable>
  );
}
