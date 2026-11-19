import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { UNITS } from '../context/InventoryContext';
import { radius } from '../constants/theme';

export default function UnitPicker({ value, onChange, label = 'Unit' }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginVertical: 7 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {UNITS.map((u) => {
          const on = u === value;
          return (
            <Pressable key={u} onPress={() => onChange(u)} style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: on ? colors.primary : colors.inputBg }}>
              <Text style={{ fontSize: 13.5, fontWeight: '800', color: on ? '#fff' : colors.textMuted }}>{u}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
