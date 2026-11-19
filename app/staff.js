import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import NoAccess from '../components/NoAccess';
import { useAuth, usePermissions, ROLES, ROLE_LABEL } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

const CAN = [
  ['Manager', 'Everything, plus manage staff roles'],
  ['Chef', 'Add, edit, delete, restore and force-delete stock, edit costs, log waste, manage the menu, reports, activity log'],
  ['Cook', 'View stock and the menu, and mark items as used'],
];

export default function StaffScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { staff, setRole, currentUser } = useAuth();
  const { log } = useActivity();
  const [open, setOpen] = useState(false);

  if (!perms.staff) return <NoAccess title="Staff" />;

  const change = async (person, role) => {
    if (person.role === role) return;
    const r = await setRole(person.email, role);
    if (!r.ok) { Alert.alert('Not changed', r.error); return; }
    log({ action: 'role', target: person.fullName, detail: `${ROLE_LABEL[person.role]} → ${ROLE_LABEL[role]}` });
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Staff" subtitle={`${staff.length + 1} accounts`} />

      <Pressable onPress={() => setOpen((o) => !o)} style={styles.legend}>
        <Ionicons name="shield-checkmark" size={18} color={colors.primaryMid} />
        <Text style={styles.legendTitle}>What each role can do</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && (
        <View style={styles.legendBody}>
          {CAN.map(([r, t]) => (
            <Text key={r} style={styles.legendLine}><Text style={{ fontWeight: '900', color: colors.text }}>{r}: </Text>{t}</Text>
          ))}
        </View>
      )}

      <View style={styles.person}>
        <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Admin</Text>
          <Text style={styles.email}>admin123 · built-in account</Text>
        </View>
        <View style={[styles.roleTag, { backgroundColor: colors.primarySoft }]}><Text style={[styles.roleTagText, { color: colors.primaryMid }]}>Manager</Text></View>
      </View>

      {staff.length === 0 && <Text style={styles.empty}>No other accounts yet. People who register on this device appear here as Cooks.</Text>}

      {staff.map((p) => (
        <View key={p.email} style={styles.personCol}>
          <View style={styles.personRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(p.fullName || '?')[0].toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.fullName}{p.email === currentUser.email ? ' (you)' : ''}</Text>
              <Text style={styles.email}>{p.email}</Text>
            </View>
          </View>
          <View style={styles.roles}>
            {ROLES.map((r) => {
              const on = p.role === r;
              return (
                <Pressable key={r} onPress={() => change(p, r)} disabled={p.email === currentUser.email} style={[styles.role, on && styles.roleOn, p.email === currentUser.email && { opacity: 0.6 }]}>
                  <Text style={[styles.roleText, on && { color: '#fff' }]}>{ROLE_LABEL[r]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  legend: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
  legendTitle: { flex: 1, fontSize: 14.5, fontWeight: '800', color: colors.text },
  legendBody: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginTop: 8, gap: 8, borderWidth: 1, borderColor: colors.border },
  legendLine: { fontSize: 13, color: colors.textMuted, lineHeight: 19, fontWeight: '600' },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginTop: 14, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  personCol: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginTop: 12, gap: 12, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontWeight: '900', color: colors.primaryMid },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  email: { fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  roleTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  roleTagText: { fontSize: 12.5, fontWeight: '800' },
  roles: { flexDirection: 'row', gap: 8 },
  role: { flex: 1, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.inputBg, alignItems: 'center' },
  roleOn: { backgroundColor: colors.primary },
  roleText: { fontSize: 13.5, fontWeight: '800', color: colors.textMuted },
  empty: { textAlign: 'center', color: colors.textMuted, fontWeight: '600', marginVertical: 30, paddingHorizontal: 20 },
});
