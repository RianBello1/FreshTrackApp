import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import ItemCard from '../components/ItemCard';
import InputField from '../components/InputField';
import ThemeToggle from '../components/ThemeToggle';
import QuantityModal from '../components/QuantityModal';
import { useInventory } from '../context/InventoryContext';
import { useAuth, usePermissions, ROLE_LABEL } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius, EXPIRING_DAYS } from '../constants/theme';
import { money } from '../utils/format';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const { items, trash, stats, deleteItem, consumeItem } = useInventory();
  const { currentUser, logout } = useAuth();
  const perms = usePermissions();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [useTarget, setUseTarget] = useState(null);

  const firstName = ((currentUser && currentUser.fullName) || '').split(' ')[0];
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];
  const q = search.toLowerCase();
  const filtered = items
    .filter((i) => (activeCat === 'All' || i.category === activeCat) && (i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const tools = [
    { key: 'specials', label: 'Specials', icon: 'sparkles', to: '/specials', show: true },
    { key: 'menu', label: 'Menu', icon: 'restaurant', to: '/menu', show: true },
    { key: 'meals', label: 'Meals', icon: 'search', to: '/meals', show: true },
    { key: 'waste', label: 'Waste', icon: 'flame', to: '/waste', show: perms.waste },
    { key: 'reports', label: 'Reports', icon: 'document-text', to: '/reports', show: perms.reports },
    { key: 'activity', label: 'Activity', icon: 'time', to: '/activity', show: perms.log },
    { key: 'staff', label: 'Staff', icon: 'people', to: '/staff', show: perms.staff },
    { key: 'trash', label: 'Trash', icon: 'trash', to: '/trash', show: perms.trash, badge: trash.length },
  ].filter((t) => t.show);
  const tileW = (width - 40 - 12 * 3) / 4;

  return (
    <Screen backgroundColor={colors.bg} edges={['left', 'right']} barStyle="light-content">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.blob} />
          <View style={styles.heroTop}>
            <View style={styles.brandRow}>
              <View style={styles.logo}><Ionicons name="leaf" size={20} color="#0F3D22" /></View>
              <View>
                <Text style={styles.brand}>FreshTrack</Text>
                <Text style={styles.brandSub}>{firstName ? `Hi, ${firstName} · ${ROLE_LABEL[currentUser.role]}` : 'Your kitchen inventory'}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <ThemeToggle />
              <Pressable onPress={() => { logout(); router.replace('/'); }} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{items.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={[styles.stat, { flex: 1.5 }]}>
              <Text style={styles.statNum} numberOfLines={1} adjustsFontSizeToFit>{money(stats.stockValue)}</Text>
              <Text style={styles.statLabel}>Stock value</Text>
            </View>
            <Pressable onPress={() => router.push('/expiring-soon')} style={({ pressed }) => [styles.stat, styles.statAlert, pressed && { opacity: 0.85 }]}>
              <View style={styles.alertTop}>
                <Text style={[styles.statNum, { color: '#FECACA' }]}>{stats.expiringCount}</Text>
                <Ionicons name="chevron-forward" size={16} color="#FECACA" />
              </View>
              <Text style={[styles.statLabel, { color: '#FECACA' }]}>Expiring</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <InputField icon="search" placeholder="Search by name or category" value={search} onChangeText={setSearch} style={{ marginTop: -26, marginVertical: 0 }} />

          {stats.expiringValue > 0 && (
            <Pressable onPress={() => router.push('/specials')} style={({ pressed }) => [styles.risk, pressed && { opacity: 0.85 }]}>
              <Ionicons name="alert-circle" size={20} color={colors.warning} />
              <Text style={styles.riskText}>
                <Text style={{ fontWeight: '900' }}>{money(stats.expiringValue)}</Text> of stock expires within {EXPIRING_DAYS} days. See dish ideas
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.warning} />
            </Pressable>
          )}

          <View style={styles.tools}>
            {tools.map((t) => (
              <Pressable key={t.key} onPress={() => router.push(t.to)} style={({ pressed }) => [styles.tool, { width: tileW }, pressed && { opacity: 0.7 }]}>
                <View style={styles.toolIcon}>
                  <Ionicons name={t.icon} size={22} color={colors.primaryMid} />
                  {!!t.badge && <View style={styles.badge}><Text style={styles.badgeText}>{t.badge > 99 ? '99+' : t.badge}</Text></View>}
                </View>
                <Text style={styles.toolLabel} numberOfLines={1}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {categories.map((cat) => {
              const active = cat === activeCat;
              return (
                <Pressable key={cat} onPress={() => setActiveCat(cat)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Inventory</Text>
            <Text style={styles.sectionCount}>{filtered.length} item{filtered.length === 1 ? '' : 's'} · soonest first</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}><Ionicons name="basket-outline" size={30} color={colors.primary} /></View>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyText}>Try a different search{perms.edit ? ' or add a new item.' : '.'}</Text>
            </View>
          ) : (
            filtered.map((item) => (
              <ItemCard key={item.id} item={item} onPress={() => router.push(`/details/${item.id}`)} onUse={setUseTarget} onDelete={perms.trash ? deleteItem : undefined} />
            ))
          )}
        </View>
      </ScrollView>

      {perms.edit && (
        <Pressable onPress={() => router.push('/add-item')} style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.96 }] }]}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.fabText}>Add item</Text>
        </Pressable>
      )}

      <QuantityModal
        visible={!!useTarget} mode="used" item={useTarget}
        onCancel={() => setUseTarget(null)}
        onSubmit={(qty) => { consumeItem(useTarget.id, qty); setUseTarget(null); }}
      />
    </Screen>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  hero: { backgroundColor: colors.primaryDark, paddingTop: 64, paddingHorizontal: 20, paddingBottom: 48, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  blob: { position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: 999, backgroundColor: '#16A34A', opacity: 0.2 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  logo: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#86EFAC', alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  brandSub: { fontSize: 12, color: colors.heroText },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.lg, padding: 14, justifyContent: 'center' },
  statAlert: { backgroundColor: 'rgba(220,38,38,0.25)' },
  alertTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statNum: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: colors.heroText, marginTop: 2, fontWeight: '600' },
  content: { paddingHorizontal: 20 },
  risk: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.warningSoft, borderRadius: radius.md, padding: 12, marginTop: 14 },
  riskText: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600', lineHeight: 18 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 },
  tool: { alignItems: 'center', gap: 6 },
  toolIcon: { width: '100%', aspectRatio: 1, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  toolLabel: { fontSize: 12, fontWeight: '800', color: colors.text },
  badge: { position: 'absolute', top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  chips: { gap: 8, paddingVertical: 18 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  chipTextActive: { color: '#fff' },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  sectionCount: { fontSize: 12.5, color: colors.textMuted, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { width: 68, height: 68, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 28, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingVertical: 15, paddingHorizontal: 22, borderRadius: radius.pill, ...shadow.float },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
