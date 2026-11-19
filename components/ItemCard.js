import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AllergenTags } from './AllergenChips';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius, categoryStyle, freshness, isPlaceholderImage } from '../constants/theme';
import { money, qtyText } from '../utils/format';

// onUse: show the "mark as used" button. onDelete: show the trash button (chef/manager only).
export default function ItemCard({ item, onPress, onUse, onDelete }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [imgFailed, setImgFailed] = useState(false);
  const status = freshness(item.daysLeft, colors);
  const cat = categoryStyle(item.category);
  const showImage = !isPlaceholderImage(item.image) && !imgFailed;
  const value = (item.quantity || 0) * (item.costPerUnit || 0);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && onPress && { transform: [{ scale: 0.985 }] }]}>
      <View style={[styles.accent, { backgroundColor: status.color }]} />
      {showImage ? (
        <Image source={{ uri: item.image }} style={styles.thumb} onError={() => setImgFailed(true)} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: cat.bg, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name={cat.icon} size={28} color={cat.color} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.category} · {qtyText(item.quantity, item.unit)}{value > 0 ? ` · ${money(value)}` : ''}</Text>
        <View style={styles.footer}>
          <View style={[styles.pill, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.pillText, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={styles.date}>{item.expiryDate}</Text>
          </View>
        </View>
        <AllergenTags value={item.allergens} style={{ marginTop: 6 }} />
      </View>
      <View style={{ gap: 8 }}>
        {onUse && (
          <Pressable onPress={() => onUse(item)} hitSlop={8} style={({ pressed }) => [styles.action, { backgroundColor: colors.primarySoft }, pressed && { opacity: 0.5 }]}>
            <Ionicons name="checkmark-done" size={19} color={colors.primaryMid} />
          </Pressable>
        )}
        {onDelete && (
          <Pressable onPress={() => onDelete(item.id)} hitSlop={8} style={({ pressed }) => [styles.action, { backgroundColor: colors.dangerSoft }, pressed && { opacity: 0.5 }]}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, paddingLeft: 16, marginBottom: 12, overflow: 'hidden', borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  thumb: { width: 62, height: 62, borderRadius: radius.md, backgroundColor: colors.inputBg },
  body: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontSize: 11.5, fontWeight: '800' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  date: { fontSize: 12, color: colors.textMuted },
  action: { width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
