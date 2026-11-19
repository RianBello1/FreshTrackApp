import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

export default function ScreenHeader({ title, subtitle, right, onBack }) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack || (() => router.back())} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]} hitSlop={8}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  back: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4, color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 1 },
});
