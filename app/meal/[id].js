import React, { useEffect, useState } from 'react';
import { View, Text, Image, Switch, ActivityIndicator, Linking, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import CustomButton from '../../components/CustomButton';
import { AllergenTags } from '../../components/AllergenChips';
import { useMenu } from '../../context/MenuContext';
import { useInventory } from '../../context/InventoryContext';
import { usePermissions } from '../../context/AuthContext';
import { useThemedStyles, useTheme } from '../../context/ThemeContext';
import { radius, EXPIRING_DAYS } from '../../constants/theme';
import { detectAll } from '../../utils/allergens';
import { lookupMeal } from '../../utils/mealdb';
import { sameIngredient } from '../../utils/match';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { dishes, addDish, toggleDish } = useMenu();
  const { items } = useInventory();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const saved = dishes.find((d) => d.mealId === String(id));

  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    lookupMeal(String(id))
      .then((m) => { if (alive) { setMeal(m); if (!m) setError('Meal not found.'); } })
      .catch(() => { if (alive) setError('Could not reach TheMealDB.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, retry]);

  // Saved dishes can be viewed offline.
  const view = meal || (saved ? { ...saved, mealId: saved.mealId } : null);

  if (!view) {
    return (
      <Screen scroll>
        <ScreenHeader title="Meal" />
        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} /> : (
          <View style={{ alignItems: 'center', paddingVertical: 50 }}>
            <Text style={{ color: colors.textMuted, fontWeight: '700', marginBottom: 12 }}>{error}</Text>
            <CustomButton title="Retry" type="secondary" icon="refresh" onPress={() => setRetry((r) => r + 1)} />
          </View>
        )}
      </Screen>
    );
  }

  const allergens = detectAll(view.ingredients.map((i) => i.name));
  const stockFor = (name) => items.find((i) => i.quantity > 0 && sameIngredient(i.name, name));

  const add = () => {
    const r = addDish({
      source: 'mealdb', mealId: view.mealId, name: view.name, category: view.category, area: view.area, image: view.image,
      instructions: view.instructions, ingredients: view.ingredients, allergens, enabled: true,
    });
    if (!r.ok) Alert.alert('Not saved', r.error);
  };

  return (
    <Screen scroll>
      <ScreenHeader title={view.name} subtitle={[view.category, view.area].filter(Boolean).join(' · ')} />
      {!!view.image && <Image source={{ uri: view.image }} style={styles.hero} />}

      <View style={styles.card}>
        <AllergenTags value={allergens} />
        {allergens.length === 0 && <Text style={styles.muted}>No common allergens detected in the ingredient names.</Text>}
        <Text style={styles.fine}>Auto-detected from ingredient names. Always verify.</Text>
      </View>

      {saved ? (
        <View style={[styles.card, styles.rowCard]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{saved.enabled ? 'Served on the menu' : 'Not being served'}</Text>
            <Text style={styles.muted}>{perms.menu ? 'Switch to turn it on or off.' : 'Only chefs and managers can change this.'}</Text>
          </View>
          <Switch value={saved.enabled} onValueChange={perms.menu ? () => toggleDish(saved.id) : undefined} disabled={!perms.menu} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
        </View>
      ) : perms.menu ? (
        <CustomButton title="Add to menu" icon="add-circle" onPress={add} style={{ marginTop: 14 }} />
      ) : (
        <View style={[styles.card, { flexDirection: 'row', gap: 8, alignItems: 'center' }]}>
          <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
          <Text style={styles.muted}>Only chefs and managers can add dishes to the menu.</Text>
        </View>
      )}

      <Text style={styles.section}>Ingredients</Text>
      <View style={styles.card}>
        {view.ingredients.map((ing, idx) => {
          const s = stockFor(ing.name);
          const expiring = s && s.daysLeft <= EXPIRING_DAYS;
          return (
            <View key={`${ing.name}-${idx}`} style={[styles.ingRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Ionicons name={s ? (expiring ? 'time' : 'checkmark-circle') : 'ellipse-outline'} size={18} color={s ? (expiring ? colors.warning : colors.primaryMid) : colors.textMuted} />
              <Text style={styles.ingName}>{ing.name}</Text>
              <Text style={styles.measure}>{ing.measure}</Text>
              {s && <Text style={[styles.stockTag, expiring && { color: colors.warning }]}>{expiring ? `use soon (${s.daysLeft < 0 ? 'expired' : s.daysLeft + 'd'})` : 'in stock'}</Text>}
            </View>
          );
        })}
      </View>

      {!!view.instructions && (
        <>
          <Text style={styles.section}>Method</Text>
          <View style={styles.card}><Text style={styles.body}>{view.instructions}</Text></View>
        </>
      )}
      {!!view.youtube && <CustomButton title="Watch on YouTube" type="secondary" icon="logo-youtube" onPress={() => Linking.openURL(view.youtube)} style={{ marginTop: 14 }} />}
      {!!error && !meal && <Text style={[styles.fine, { textAlign: 'center', marginTop: 12 }]}>Showing the saved copy (offline).</Text>}
    </Screen>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  hero: { width: '100%', height: 220, borderRadius: radius.xl, marginBottom: 14, backgroundColor: colors.inputBg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginTop: 12, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, fontWeight: '600', flexShrink: 1 },
  fine: { fontSize: 11.5, color: colors.textMuted, marginTop: 8 },
  section: { fontSize: 19, fontWeight: '800', color: colors.text, marginTop: 22, letterSpacing: -0.3 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  ingName: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.text },
  measure: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  stockTag: { fontSize: 11, fontWeight: '800', color: colors.primaryMid },
  body: { fontSize: 14, color: colors.text, lineHeight: 22 },
});
