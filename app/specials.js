import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import DishCard from '../components/DishCard';
import { useInventory } from '../context/InventoryContext';
import { useMenu } from '../context/MenuContext';
import { useIngredients } from '../context/IngredientsContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius, EXPIRING_DAYS } from '../constants/theme';
import { filterByIngredient } from '../utils/mealdb';
import { bestCatalogMatch, dishStock, sameIngredient } from '../utils/match';
import { money } from '../utils/format';

const weight = (it) => EXPIRING_DAYS + 1 - Math.max(it.daysLeft, 0); // urgent items count more
const when = (it) => (it.daysLeft < 0 ? 'expired' : it.daysLeft === 0 ? 'today' : `${it.daysLeft}d`);

// Dish ideas that use ingredients close to expiry: your own menu first, then TheMealDB.
export default function SpecialsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { items } = useInventory();
  const { dishes } = useMenu();
  const { ingredients } = useIngredients();
  const [online, setOnline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const expiring = useMemo(() => items.filter((i) => i.daysLeft <= EXPIRING_DAYS).sort((a, b) => a.daysLeft - b.daysLeft), [items]);
  const atRisk = expiring.reduce((s, i) => s + (i.quantity || 0) * (i.costPerUnit || 0), 0);

  const local = useMemo(
    () => dishes
      .map((d) => {
        const used = expiring.filter((it) => d.ingredients.some((ing) => sameIngredient(it.name, ing.name)));
        return { dish: d, used, score: used.reduce((s, it) => s + weight(it), 0) };
      })
      .filter((x) => x.used.length > 0)
      .sort((a, b) => b.score - a.score || Number(b.dish.enabled) - Number(a.dish.enabled)),
    [dishes, expiring]
  );

  const sig = expiring.map((i) => `${i.id}:${i.daysLeft}`).join('|');
  useEffect(() => {
    let alive = true;
    if (!expiring.length) { setOnline([]); return; }
    setLoading(true); setError('');
    (async () => {
      try {
        const targets = expiring.slice(0, 6);
        const results = await Promise.all(targets.map(async (it) => {
          const cat = bestCatalogMatch(it.name, ingredients);
          const meals = await filterByIngredient(cat ? cat.name : it.name);
          return { it, meals };
        }));
        const map = new Map();
        results.forEach(({ it, meals }) => meals.forEach((m) => {
          const e = map.get(m.id) || { ...m, used: [], score: 0 };
          e.used.push(it); e.score += weight(it);
          map.set(m.id, e);
        }));
        const list = [...map.values()].sort((a, b) => b.score - a.score || b.used.length - a.used.length).slice(0, 20);
        if (alive) setOnline(list);
      } catch (e) {
        if (alive) setError('Could not reach TheMealDB for more ideas.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [sig, ingredients.length, retry]);

  const usedNote = (used) => `Uses ${used.map((u) => `${u.name} (${when(u)})`).join(', ')}`;
  const onMenuIds = new Set(dishes.map((d) => d.mealId).filter(Boolean));

  return (
    <Screen scroll>
      <ScreenHeader title="Today's specials" subtitle={`Ideas using stock that expires within ${EXPIRING_DAYS} days`} />

      {expiring.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Ionicons name="sparkles" size={32} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>Nothing close to expiry</Text>
          <Text style={styles.emptyText}>Nice work. Check back when stock gets closer to its date.</Text>
        </View>
      ) : (
        <>
          <View style={styles.banner}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.bannerText}><Text style={{ fontWeight: '900' }}>{expiring.length}</Text> item{expiring.length === 1 ? '' : 's'} worth <Text style={{ fontWeight: '900' }}>{money(atRisk)}</Text> to use up: {expiring.slice(0, 4).map((i) => `${i.name} (${when(i)})`).join(', ')}{expiring.length > 4 ? '…' : ''}</Text>
          </View>

          <Text style={styles.section}>From your menu</Text>
          {local.length === 0 ? (
            <Text style={styles.muted}>None of your saved dishes use these ingredients yet. Add dishes from the ideas below.</Text>
          ) : (
            local.map(({ dish, used }) => (
              <DishCard key={dish.id} dish={dish} stock={dishStock(dish, items)} note={usedNote(used)} onPress={dish.mealId ? () => router.push(`/meal/${dish.mealId}`) : undefined} onToggle={undefined} />
            ))
          )}

          <Text style={styles.section}>More ideas from TheMealDB</Text>
          {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />}
          {!!error && (
            <Pressable onPress={() => setRetry((r) => r + 1)} style={styles.error}>
              <Ionicons name="cloud-offline" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error} Tap to retry.</Text>
            </Pressable>
          )}
          {!loading && !error && online.length === 0 && <Text style={styles.muted}>No online matches found for these ingredients.</Text>}
          {online.map((m) => (
            <Pressable key={m.id} onPress={() => router.push(`/meal/${m.id}`)} style={({ pressed }) => [styles.meal, pressed && { opacity: 0.85 }]}>
              <Image source={{ uri: m.image }} style={styles.mealImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName} numberOfLines={2}>{m.name}</Text>
                <Text style={styles.mealNote} numberOfLines={2}>{usedNote(m.used)}</Text>
                {onMenuIds.has(m.id) && <Text style={styles.onMenu}>Already on your menu</Text>}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </>
      )}
    </Screen>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  banner: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.warningSoft, borderRadius: radius.md, padding: 12 },
  bannerText: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600', lineHeight: 19 },
  section: { fontSize: 19, fontWeight: '800', color: colors.text, marginTop: 22, marginBottom: 12, letterSpacing: -0.3 },
  muted: { fontSize: 13.5, color: colors.textMuted, fontWeight: '600', lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyIcon: { width: 72, height: 72, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerSoft, padding: 12, borderRadius: radius.md },
  errorText: { flex: 1, fontSize: 13, color: colors.danger, fontWeight: '700' },
  meal: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 10, marginBottom: 10, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  mealImg: { width: 66, height: 66, borderRadius: radius.md, backgroundColor: colors.inputBg },
  mealName: { fontSize: 15.5, fontWeight: '800', color: colors.text },
  mealNote: { fontSize: 12.5, fontWeight: '700', color: colors.warning, marginTop: 3 },
  onMenu: { fontSize: 11.5, fontWeight: '800', color: colors.primaryMid, marginTop: 3 },
});
