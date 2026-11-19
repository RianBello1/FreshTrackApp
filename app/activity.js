import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import NoAccess from '../components/NoAccess';
import { useActivity } from '../context/ActivityContext';
import { usePermissions, ROLE_LABEL } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';
import { formatDateTime } from '../utils/format';

const META = {
  add: { icon: 'add-circle', label: 'Added', tone: 'good' },
  edit: { icon: 'create', label: 'Edited', tone: 'neutral' },
  delete: { icon: 'trash', label: 'Trashed', tone: 'bad' },
  restore: { icon: 'arrow-undo', label: 'Restored', tone: 'good' },
  purge: { icon: 'close-circle', label: 'Deleted forever', tone: 'bad' },
  use: { icon: 'checkmark-done', label: 'Used', tone: 'good' },
  waste: { icon: 'flame', label: 'Waste', tone: 'warn' },
  menu: { icon: 'restaurant', label: 'Menu', tone: 'neutral' },
  dish: { icon: 'book', label: 'Dish', tone: 'neutral' },
  role: { icon: 'people', label: 'Role', tone: 'neutral' },
};

export default function ActivityScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { entries } = useActivity();
  const [filter, setFilter] = useState('all');

  if (!perms.log) return <NoAccess title="Activity log" />;

  const tone = (t) => ({ good: [colors.primarySoft, colors.primaryMid], bad: [colors.dangerSoft, colors.danger], warn: [colors.warningSoft, colors.warning], neutral: [colors.inputBg, colors.textMuted] }[t]);
  const filters = [['all', 'All'], ['add', 'Added'], ['edit', 'Edited'], ['delete', 'Trashed'], ['restore', 'Restored'], ['use', 'Used'], ['waste', 'Waste']];
  const list = entries.filter((e) => filter === 'all' || e.action === filter);

  return (
    <Screen scroll>
      <ScreenHeader title="Activity log" subtitle={`${entries.length} recorded actions`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {filters.map(([k, l]) => (
          <Pressable key={k} onPress={() => setFilter(k)} style={[styles.chip, filter === k && styles.chipOn]}>
            <Text style={[styles.chipText, filter === k && { color: '#fff' }]}>{l}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {list.length === 0 ? (
        <Text style={styles.empty}>No activity yet. Changes to stock, the menu and staff show up here.</Text>
      ) : (
        list.map((e) => {
          const m = META[e.action] || META.edit;
          const [bg, fg] = tone(m.tone);
          return (
            <View key={e.id} style={styles.row}>
              <View style={[styles.icon, { backgroundColor: bg }]}><Ionicons name={m.icon} size={18} color={fg} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={2}><Text style={{ color: fg }}>{m.label}</Text> · {e.target}</Text>
                {!!e.detail && <Text style={styles.detail} numberOfLines={2}>{e.detail}</Text>}
                <Text style={styles.meta}>{e.user} ({ROLE_LABEL[e.role] || e.role}) · {formatDateTime(e.ts)}</Text>
              </View>
            </View>
          );
        })
      )}
    </Screen>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  chips: { gap: 8, paddingBottom: 14 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  empty: { textAlign: 'center', color: colors.textMuted, fontWeight: '600', marginVertical: 40, paddingHorizontal: 20 },
  row: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  icon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14.5, fontWeight: '800', color: colors.text },
  detail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  meta: { fontSize: 11.5, color: colors.textMuted, marginTop: 5, fontWeight: '600' },
});
