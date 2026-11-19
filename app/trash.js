import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import TrashCard from '../components/TrashCard';
import ConfirmModal from '../components/ConfirmModal';
import NoAccess from '../components/NoAccess';
import { useInventory, TRASH_DAYS } from '../context/InventoryContext';
import { usePermissions } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

export default function TrashScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { trash, restoreItems, purgeItems, purgeExpired } = useInventory();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { purgeExpired(); }, []);

  if (!perms.trash) return <NoAccess title="Trash" />;

  const valid = selected.filter((id) => trash.some((t) => t.id === id));
  const count = valid.length;
  const allSelected = trash.length > 0 && count === trash.length;
  const toggle = (id) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const exitSelect = () => { setSelecting(false); setSelected([]); };

  return (
    <Screen>
      <View style={styles.top}>
        <ScreenHeader
          title="Trash" subtitle={`${trash.length} item${trash.length === 1 ? '' : 's'}`}
          right={trash.length > 0 ? (
            <Pressable onPress={selecting ? exitSelect : () => setSelecting(true)} hitSlop={8} style={styles.selectBtn}>
              <Text style={styles.selectText}>{selecting ? 'Done' : 'Select'}</Text>
            </Pressable>
          ) : null}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 170 }} showsVerticalScrollIndicator={false}>
        <View style={styles.info}>
          <Ionicons name="information-circle" size={18} color={colors.primaryMid} />
          <Text style={styles.infoText}>Deleted items stay here for {TRASH_DAYS} days, then they're removed automatically.</Text>
        </View>

        {selecting && trash.length > 0 && (
          <Pressable onPress={() => setSelected(allSelected ? [] : trash.map((t) => t.id))} style={styles.selectAll}>
            <Ionicons name={allSelected ? 'checkbox' : 'square-outline'} size={20} color={colors.primaryMid} />
            <Text style={styles.selectAllText}>{allSelected ? 'Clear selection' : 'Select all'}</Text>
          </Pressable>
        )}

        {trash.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="trash-bin-outline" size={32} color={colors.primary} /></View>
            <Text style={styles.emptyTitle}>Trash is empty</Text>
            <Text style={styles.emptyText}>Deleted items will show up here.</Text>
          </View>
        ) : (
          trash.map((item) => (
            <TrashCard
              key={item.id} item={item} selecting={selecting} selected={valid.includes(item.id)}
              onToggle={() => (selecting ? toggle(item.id) : (setSelecting(true), setSelected([item.id])))}
              onLongPress={() => { setSelecting(true); if (!valid.includes(item.id)) toggle(item.id); }}
            />
          ))
        )}
      </ScrollView>

      {selecting && (
        <View style={styles.bar}>
          <Text style={styles.barCount}>{count} selected</Text>
          <View style={styles.barBtns}>
            <Pressable disabled={count === 0} onPress={() => { restoreItems(valid); exitSelect(); }} style={({ pressed }) => [styles.barBtn, { backgroundColor: colors.primary }, count === 0 && styles.disabled, pressed && { opacity: 0.85 }]}>
              <Ionicons name="arrow-undo" size={18} color="#fff" /><Text style={styles.barBtnText}>Restore</Text>
            </Pressable>
            <Pressable disabled={count === 0} onPress={() => setConfirmDelete(true)} style={({ pressed }) => [styles.barBtn, { backgroundColor: colors.danger }, count === 0 && styles.disabled, pressed && { opacity: 0.85 }]}>
              <Ionicons name="trash" size={18} color="#fff" /><Text style={styles.barBtnText}>Delete forever</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ConfirmModal
        visible={confirmDelete} destructive icon="warning" title="Are you sure?"
        message={`${count} item${count === 1 ? '' : 's'} will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete forever"
        onConfirm={() => { purgeItems(valid); setConfirmDelete(false); exitSelect(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
  top: { paddingHorizontal: 20, paddingTop: 20 },
  selectBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  selectText: { fontSize: 14, fontWeight: '800', color: colors.primaryMid },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primarySoft, padding: 12, borderRadius: radius.md, marginBottom: 14 },
  infoText: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' },
  selectAll: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingVertical: 4 },
  selectAllText: { fontSize: 14, fontWeight: '800', color: colors.primaryMid },
  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyIcon: { width: 72, height: 72, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  bar: { position: 'absolute', left: 16, right: 16, bottom: 24, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.border, ...shadow.float },
  barCount: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textAlign: 'center' },
  barBtns: { flexDirection: 'row', gap: 10 },
  barBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: radius.md },
  barBtnText: { color: '#fff', fontSize: 14.5, fontWeight: '800' },
  disabled: { opacity: 0.35 },
});
