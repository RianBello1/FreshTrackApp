import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ALLERGENS } from '../utils/allergens';
import { radius } from '../constants/theme';

// Read-only little tags.
export function AllergenTags({ value = [], style }) {
  const { colors } = useTheme();
  if (!value.length) return null;
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }, style]}>
      {value.map((a) => (
        <View key={a} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.warningSoft }}>
          <Ionicons name="warning" size={10} color={colors.warning} />
          <Text style={{ fontSize: 10.5, fontWeight: '800', color: colors.warning }}>{a}</Text>
        </View>
      ))}
    </View>
  );
}

// Editable: tap to toggle each allergen.
export default function AllergenChips({ value = [], onChange, label = 'Allergens' }) {
  const { colors } = useTheme();
  const toggle = (a) => onChange(value.includes(a) ? value.filter((x) => x !== a) : [...value, a]);
  return (
    <View style={{ marginVertical: 7 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {ALLERGENS.map((a) => {
          const on = value.includes(a);
          return (
            <Pressable key={a} onPress={() => toggle(a)} style={[styles.chip, { backgroundColor: on ? colors.warningSoft : colors.inputBg, borderColor: on ? colors.warning : 'transparent' }]}>
              {on && <Ionicons name="warning" size={12} color={colors.warning} />}
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: on ? colors.warning : colors.textMuted }}>{a}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 6 }}>Suggested from the ingredient name. Always double-check with the supplier label.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.5 },
});
