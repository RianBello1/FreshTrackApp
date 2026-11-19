import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

// type: 'primary' | 'secondary' | 'ghost' | 'danger'
export default function CustomButton({ title, onPress, type = 'primary', icon, style, disabled }) {
  const { colors } = useTheme();
  const v = {
    primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.primaryMid, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.textMuted, border: 'transparent' },
    danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
  }[type] || { bg: colors.primary, fg: '#fff', border: colors.primary };
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: v.bg, borderColor: v.border }, disabled && { opacity: 0.4 }, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }, style]}
    >
      <View style={styles.inner}>
        {!!icon && <Ionicons name={icon} size={18} color={v.fg} />}
        <Text style={[styles.text, { color: v.fg }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginVertical: 6, borderWidth: 1.5 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
