import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import CustomButton from '../components/CustomButton';
import ConfirmModal from '../components/ConfirmModal';
import NoAccess from '../components/NoAccess';
import { useInventory } from '../context/InventoryContext';
import { usePermissions } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';
import { REPORT_KINDS, buildReport, exportCSV, exportPDF, printReport } from '../utils/reports';

export default function ReportsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { items, records } = useInventory();
  const [kind, setKind] = useState('expiry');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  const report = useMemo(() => buildReport(kind, { items, records }), [kind, items, records]);

  if (!perms.reports) return <NoAccess title="Reports" />;

  const run = async (key, fn) => {
    setBusy(key);
    try {
      await fn(report);
    } catch (e) {
      const m = String((e && e.message) || e);
      if (m.startsWith('MISSING:')) {
        setMsg({ title: 'One more install needed', text: `Run this in your project, then restart the app:\n\nnpx expo install ${m.slice(8)}` });
      } else {
        setMsg({ title: 'Could not export', text: m });
      }
    } finally {
      setBusy('');
    }
  };

  const preview = report.rows.slice(0, 8);

  return (
    <Screen scroll>
      <ScreenHeader title="Reports" subtitle="Print or export for the head chef" />

      <View style={styles.kinds}>
        {REPORT_KINDS.map((k) => (
          <Pressable key={k.key} onPress={() => setKind(k.key)} style={[styles.kind, kind === k.key && styles.kindOn]}>
            <Ionicons name={k.icon} size={18} color={kind === k.key ? '#fff' : colors.primaryMid} />
            <Text style={[styles.kindText, kind === k.key && { color: '#fff' }]} numberOfLines={2}>{k.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.sub}>{report.subtitle}</Text>
        <View style={styles.sums}>
          {report.summary.map((s) => (
            <View key={s.label} style={styles.sum}>
              <Text style={styles.sumLabel}>{s.label}</Text>
              <Text style={styles.sumValue} numberOfLines={1} adjustsFontSizeToFit>{s.value}</Text>
            </View>
          ))}
        </View>

        {preview.length === 0 ? (
          <Text style={styles.empty}>Nothing to report for this period.</Text>
        ) : (
          preview.map((row, i) => (
            <View key={i} style={[styles.prow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={styles.pname} numberOfLines={1}>{row[0] === undefined ? '' : row[kind === 'waste' ? 1 : 0]}</Text>
              <Text style={styles.pmeta} numberOfLines={1}>{kind === 'waste' ? `${row[3]} · ${row[4]}` : kind === 'expiry' ? `${row[3]} · ${row[4]}` : `${row[2]} · ${row[4]}`}</Text>
            </View>
          ))
        )}
        {report.rows.length > preview.length && <Text style={styles.more}>+ {report.rows.length - preview.length} more rows in the export</Text>}
      </View>

      <CustomButton title="Export PDF" icon="document" onPress={() => run('pdf', exportPDF)} disabled={!!busy} style={{ marginTop: 14 }} />
      <CustomButton title="Print" type="secondary" icon="print" onPress={() => run('print', printReport)} disabled={!!busy} />
      <CustomButton title="Export spreadsheet (CSV)" type="secondary" icon="grid" onPress={() => run('csv', exportCSV)} disabled={!!busy} />
      {!!busy && <Text style={styles.busy}>Preparing…</Text>}

      <ConfirmModal visible={!!msg} icon="document-text" title={msg && msg.title} message={msg && msg.text} confirmLabel="OK" hideCancel onConfirm={() => setMsg(null)} />
    </Screen>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  kinds: { flexDirection: 'row', gap: 8 },
  kind: { flex: 1, gap: 6, padding: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  kindOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  kindText: { fontSize: 12.5, fontWeight: '800', color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginTop: 14, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  title: { fontSize: 19, fontWeight: '900', color: colors.text, letterSpacing: -0.3 },
  sub: { fontSize: 12.5, color: colors.textMuted, marginTop: 3 },
  sums: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 14 },
  sum: { backgroundColor: colors.inputBg, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 9, minWidth: '30%', flexGrow: 1 },
  sumLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  sumValue: { fontSize: 17, fontWeight: '900', color: colors.text, marginTop: 2 },
  prow: { paddingVertical: 9 },
  pname: { fontSize: 14.5, fontWeight: '800', color: colors.text },
  pmeta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  more: { fontSize: 12.5, color: colors.textMuted, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  empty: { textAlign: 'center', color: colors.textMuted, fontWeight: '600', paddingVertical: 16 },
  busy: { textAlign: 'center', color: colors.textMuted, fontWeight: '700', marginTop: 8 },
});
