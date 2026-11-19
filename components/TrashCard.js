import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius, categoryStyle } from '../constants/theme';
import { qtyText } from '../utils/format';

export default function TrashCard({ item, selecting, selected, onToggle, onLongPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const cat = categoryStyle(item.category);
  const urgent = item.purgeInDays <= 3;
  const deleted = item.deletedDaysAgo === 0 ? 'Deleted today' : `Deleted ${item.deletedDaysAgo}d ago`;
  return (
    <Pressable onPress={onToggle} onLongPress={onLongPress} style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && { transform: [{ scale: 0.985 }] }]}>
      {selecting && (
        <View style={[styles.check, selected && styles.checkOn]}>{selected && <Ionicons name="checkmark" size={16} color="#fff" />}</View>
      )}
      <View style={[styles.thumb, { backgroundColor: cat.bg }]}><Ionicons name={cat.icon} size={24} color={cat.color} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.category} · {qtyText(item.quantity, item.unit)} · {deleted}</Text>
        <View style={[styles.pill, { backgroundColor: urgent ? colors.dangerSoft : colors.inputBg }]}>
          <Ionicons name="hourglass-outline" size={12} color={urgent ? colors.danger : colors.textMuted} />
          <Text style={[styles.pillText, { color: urgent ? colors.danger : colors.textMuted }]}>
            {item.purgeInDays === 0 ? 'Auto-deletes today' : `Auto-deletes in ${item.purgeInDays} day${item.purgeInDays === 1 ? '' : 's'}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: isDark ? colors.border : 'transparent', ...shadow.card },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  check: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  thumb: { width: 54, height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16.5, fontWeight: '800', color: colors.text },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontSize: 11.5, fontWeight: '800' },
});
