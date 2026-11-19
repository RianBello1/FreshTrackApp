import React, { useState } from 'react';
import { View, Text, Image, Pressable, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AllergenTags } from './AllergenChips';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius, categoryStyle, isPlaceholderImage } from '../constants/theme';

// stock: { have, total } (optional). onToggle: shows the "served on menu" switch.
export default function DishCard({ dish, stock, note, onPress, onToggle, canToggle }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [failed, setFailed] = useState(false);
  const cat = categoryStyle(dish.category);
  const showImage = !isPlaceholderImage(dish.image) && !failed;
  const full = stock && stock.total > 0 && stock.have === stock.total;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, !dish.enabled && { opacity: 0.7 }, pressed && onPress && { transform: [{ scale: 0.985 }] }]}>
      {showImage ? (
        <Image source={{ uri: dish.image }} style={styles.thumb} onError={() => setFailed(true)} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: cat.bg, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name={cat.icon} size={28} color={cat.color} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{dish.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{[dish.category, dish.area].filter(Boolean).join(' · ')}</Text>
        {!!stock && stock.total > 0 && (
          <View style={styles.stockRow}>
            <Ionicons name={full ? 'checkmark-circle' : 'basket-outline'} size={13} color={full ? colors.primaryMid : colors.textMuted} />
            <Text style={[styles.stock, full && { color: colors.primaryMid }]}>In stock {stock.have}/{stock.total} ingredients</Text>
          </View>
        )}
        {!!note && <Text style={styles.note} numberOfLines={2}>{note}</Text>}
        <AllergenTags value={dish.allergens} style={{ marginTop: 6 }} />
      </View>
      {onToggle && (
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Switch value={!!dish.enabled} onValueChange={canToggle ? onToggle : undefined} disabled={!canToggle} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
          <Text style={[styles.served, { color: dish.enabled ? colors.primaryMid : colors.textMuted }]}>{dish.enabled ? 'Served' : 'Off'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, marginBottom: 12, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  thumb: { width: 70, height: 70, borderRadius: radius.md, backgroundColor: colors.inputBg },
  title: { fontSize: 16.5, fontWeight: '800', color: colors.text },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  stock: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  note: { fontSize: 12.5, fontWeight: '700', color: colors.warning, marginTop: 5 },
  served: { fontSize: 10.5, fontWeight: '800' },
});
