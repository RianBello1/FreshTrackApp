import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import NoAccess from '../components/NoAccess';
import { useInventory } from '../context/InventoryContext';
import { usePermissions } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';
import { money, qtyText, timeAgo } from '../utils/format';

const DAY_MS = 86400000;

export default function WasteScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { records, stats } = useInventory();
  const [tab, setTab] = useState('waste');

  if (!perms.waste) return <NoAccess title="Waste & usage" />;

  const week = records.filter((r) => r.ts >= Date.now() - 7 * DAY_MS);
  const wasteWeek = week.filter((r) => r.type === 'waste');
  const byReason = {};
  wasteWeek.forEach((r) => { byReason[r.reason || 'Other'] = (byReason[r.reason || 'Other'] || 0) + r.cost; });
  const reasons = Object.entries(byReason).sort((a, b) => b[1] - a[1]);
  const max = reasons.length ? reasons[0][1] || 1 : 1;
  const list = records.filter((r) => r.type === tab).slice(0, 100);

  return (
    <Screen scroll>
      <ScreenHeader title="Waste & usage" subtitle="Last 7 days and history" />

      <View style={styles.hero}>
        <View style={styles.heroCol}>
          <Text style={styles.heroLabel}>Lost this week</Text>
          <Text style={[styles.heroNum, { color: colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>{money(stats.weeklyWaste)}</Text>
          <Text style={styles.heroSub}>{wasteWeek.length} waste entr{wasteWeek.length === 1 ? 'y' : 'ies'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.heroCol}>
          <Text style={styles.heroLabel}>Used this week</Text>
          <Text style={[styles.heroNum, { color: colors.primaryMid }]} numberOfLines={1} adjustsFontSizeToFit>{money(stats.weeklyUsed)}</Text>
          <Text style={styles.heroSub}>{week.filter((r) => r.type === 'used').length} entries</Text>
        </View>
      </View>

      {reasons.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Where it was lost</Text>
          {reasons.map(([reason, cost]) => (
            <View key={reason} style={{ marginTop: 12 }}>
              <View style={styles.reasonRow}>
                <Text style={styles.reasonName}>{reason}</Text>
                <Text style={styles.reasonCost}>{money(cost)}</Text>
              </View>
              <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(4, (cost / max) * 100)}%` }]} /></View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.tabs}>
        {[['waste', 'Waste log'], ['used', 'Used log']].map(([k, l]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]}>
            <Text style={[styles.tabText, tab === k && { color: '#fff' }]}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {list.length === 0 ? (
        <Text style={styles.empty}>{tab === 'waste' ? 'No waste logged yet. Use "Log waste" on an item.' : 'Nothing marked as used yet.'}</Text>
      ) : (
        list.map((r) => (
          <View key={r.id} style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: r.type === 'waste' ? colors.dangerSoft : colors.primarySoft }]}>
              <Ionicons name={r.type === 'waste' ? 'flame' : 'checkmark-done'} size={18} color={r.type === 'waste' ? colors.danger : colors.primaryMid} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>{r.name} · {qtyText(r.qty, r.unit)}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{r.reason ? `${r.reason} · ` : ''}{r.user} · {timeAgo(r.ts)}</Text>
            </View>
            <Text style={[styles.rowCost, { color: r.type === 'waste' ? colors.danger : colors.textMuted }]}>{money(r.cost)}</Text>
          </View>
        ))
      )}
    </Screen>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  hero: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  heroCol: { flex: 1 },
  divider: { width: 1, backgroundColor: colors.border, marginHorizontal: 14 },
  heroLabel: { fontSize: 12, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroNum: { fontSize: 25, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  heroSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginTop: 14, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  reasonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reasonName: { fontSize: 14, fontWeight: '700', color: colors.text },
  reasonCost: { fontSize: 14, fontWeight: '800', color: colors.danger },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.inputBg, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.danger },
  tabs: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 14 },
  tab: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13.5, fontWeight: '800', color: colors.textMuted },
  empty: { textAlign: 'center', color: colors.textMuted, fontWeight: '600', marginVertical: 30, paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  rowIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14.5, fontWeight: '800', color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowCost: { fontSize: 14, fontWeight: '800' },
});
