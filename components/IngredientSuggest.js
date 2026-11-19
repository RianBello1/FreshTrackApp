import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from './InputField';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { useIngredients } from '../context/IngredientsContext';
import { ingredientImage } from '../utils/mealdb';
import { radius } from '../constants/theme';

// Text field with suggestions from the TheMealDB ingredient catalog (loaded at app start).
export default function IngredientSuggest({ label, value, onChangeText, onSelect, placeholder, icon = 'search', showStatus = false, onSubmit }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { suggest, status, count, reload } = useIngredients();
  const [focused, setFocused] = useState(false);
  const list = focused && value.trim().length >= 1 ? suggest(value, 6) : [];
  const exact = list.length === 1 && list[0].name.toLowerCase() === value.trim().toLowerCase();

  return (
    <View>
      <InputField
        label={label} icon={icon} placeholder={placeholder} value={value} onChangeText={onChangeText} autoCapitalize="words"
        onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)} onSubmitEditing={onSubmit}
      />
      {list.length > 0 && !exact && (
        <View style={styles.list}>
          {list.map((ing) => (
            <Pressable key={ing.id} onPress={() => { onSelect(ing); setFocused(false); }} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.inputBg }]}>
              <Image source={{ uri: ingredientImage(ing.name) }} style={styles.thumb} />
              <Text style={styles.name} numberOfLines={1}>{ing.name}</Text>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      )}
      {showStatus && (
        <Pressable onPress={status === 'error' ? reload : undefined} style={styles.status}>
          <Ionicons
            name={status === 'ready' ? 'checkmark-circle' : status === 'error' ? 'cloud-offline' : 'cloud-download'}
            size={14} color={status === 'ready' ? colors.primaryMid : status === 'error' ? colors.danger : colors.textMuted}
          />
          <Text style={[styles.statusText, status === 'error' && { color: colors.danger }]}>
            {status === 'ready' ? `Ingredient catalog ready · ${count} ingredients from TheMealDB` : status === 'error' ? 'Catalog offline · tap to retry (you can still type any name)' : 'Loading ingredient catalog…'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
  list: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: 4, overflow: 'hidden', ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  thumb: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.inputBg },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusText: { flex: 1, fontSize: 12, color: colors.textMuted, fontWeight: '600' },
});
