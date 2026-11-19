import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import DishCard from '../components/DishCard';
import CustomButton from '../components/CustomButton';
import { useMenu } from '../context/MenuContext';
import { useInventory } from '../context/InventoryContext';
import { usePermissions } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';
import { dishStock } from '../utils/match';

export default function MenuScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { dishes, toggleDish } = useMenu();
  const { items } = useInventory();
  const [filter, setFilter] = useState('all');

  const served = dishes.filter((d) => d.enabled).length;
  const list = dishes.filter((d) => filter === 'all' || (filter === 'on' ? d.enabled : !d.enabled));

  return (
    <Screen scroll>
      <ScreenHeader
        title="Menu" subtitle={`${served} served · ${dishes.length - served} off`}
        right={perms.menu ? (
          <Pressable onPress={() => router.push('/add-recipe')} style={styles.addBtn} hitSlop={8}>
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        ) : null}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {[['all', 'All'], ['on', 'Served'], ['off', 'Off menu']].map(([k, l]) => (
          <Pressable key={k} onPress={() => setFilter(k)} style={[styles.chip, filter === k && styles.chipOn]}>
            <Text style={[styles.chipText, filter === k && { color: '#fff' }]}>{l}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {!perms.menu && (
        <View style={styles.note}>
          <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
          <Text style={styles.noteText}>Only chefs and managers can turn dishes on or off.</Text>
        </View>
      )}

      {list.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Ionicons name="restaurant-outline" size={32} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>{dishes.length === 0 ? 'No dishes yet' : 'Nothing in this view'}</Text>
          <Text style={styles.emptyText}>{dishes.length === 0 ? 'Browse TheMealDB for ideas or add your own dish.' : 'Change the filter above.'}</Text>
          {dishes.length === 0 && <CustomButton title="Browse meals" icon="search" onPress={() => router.push('/meals')} style={{ marginTop: 14, paddingHorizontal: 28 }} />}
        </View>
      ) : (
        list.map((d) => (
          <DishCard key={d.id} dish={d} stock={dishStock(d, items)} onToggle={() => toggleDish(d.id)} canToggle={perms.menu} onPress={d.mealId ? () => router.push(`/meal/${d.mealId}`) : undefined} />
        ))
      )}
    </Screen>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.inputBg, padding: 12, borderRadius: radius.md, marginBottom: 14 },
  noteText: { flex: 1, fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { width: 72, height: 72, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
});
