import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from './InputField';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';
import { addDays, addMonths, formatLong, maskDate, startOfToday, toISO, validateExpiry } from '../utils/date';

const QUICK = [
  { label: 'Today', get: () => addDays(0) },
  { label: '+3 days', get: () => addDays(3) },
  { label: '+1 week', get: () => addDays(7) },
  { label: '+2 weeks', get: () => addDays(14) },
  { label: '+1 month', get: () => addMonths(1) },
];

// Type numbers only (e.g. 20261130); dashes are added automatically.
export default function DateField({ label = 'Expiration date', value, onChangeText }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const v = validateExpiry(value);

  let helper = `Type numbers only, e.g. ${toISO(addDays(7)).replace(/-/g, '')}. Today is ${formatLong(startOfToday())}.`;
  let helperColor = colors.textMuted, helperIcon = 'information-circle-outline';
  if (v.status === 'invalid') { helper = "That isn't a real date. Format is YYYY-MM-DD."; helperColor = colors.danger; helperIcon = 'alert-circle'; }
  else if (v.status === 'valid') {
    helper = v.days < 0 ? `${v.label} · already passed (${v.when})` : `${v.label} · ${v.when}`;
    helperColor = v.days < 0 ? colors.danger : v.days <= 2 ? colors.warning : colors.primaryMid;
    helperIcon = v.days < 0 ? 'alert-circle' : 'checkmark-circle';
  }

  return (
    <View>
      <InputField icon="calendar-outline" label={label} placeholder="YYYY-MM-DD" keyboardType="number-pad" maxLength={10} value={value} onChangeText={(t) => onChangeText(maskDate(t))} />
      <View style={styles.helperRow}>
        <Ionicons name={helperIcon} size={14} color={helperColor} />
        <Text style={[styles.helper, { color: helperColor }]}>{helper}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
        {QUICK.map((q) => (
          <Pressable key={q.label} onPress={() => onChangeText(toISO(q.get()))} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.6 }]}>
            <Text style={styles.chipText}>{q.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 2 },
  helper: { flex: 1, fontSize: 12.5, fontWeight: '600' },
  chips: { gap: 8, paddingVertical: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  chipText: { fontSize: 12.5, fontWeight: '800', color: colors.primaryMid },
});
