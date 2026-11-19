import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import InputField from '../components/InputField';
import { useMenu } from '../context/MenuContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';
import { filterByCategory, listCategories, searchMeals } from '../utils/mealdb';

// Browse TheMealDB. Tap a meal to see ingredients and add it to the menu.
export default function MealsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { dishes } = useMenu();
  const [query, setQuery] = useState('');
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const reqId = useRef(0);

  useEffect(() => {
    listCategories().then((c) => { setCats(c); setCat((cur) => cur || (c.includes('Seafood') ? 'Seafood' : c[0] || '')); }).catch(() => {});
  }, [retry]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 && !cat) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const r = q.length >= 2 ? await searchMeals(q) : await filterByCategory(cat);
        if (id === reqId.current) setMeals(r);
      } catch (e) {
        if (id === reqId.current) { setError('Could not reach TheMealDB. Check your connection.'); setMeals([]); }
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, q.length >= 2 ? 400 : 0);
    return () => clearTimeout(t);
  }, [query, cat, retry]);

  const onMenu = (id) => dishes.some((d) => d.mealId === id);

  return (
    <Screen scroll>
      <ScreenHeader title="Meals" subtitle="Browse TheMealDB" />
      <InputField icon="search" placeholder="Search meals, e.g. salmon" value={query} onChangeText={setQuery} style={{ marginTop: -6 }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {cats.map((c) => (
          <Pressable key={c} onPress={() => { setQuery(''); setCat(c); }} style={[styles.chip, !query.trim() && cat === c && styles.chipOn]}>
            <Text style={[styles.chipText, !query.trim() && cat === c && { color: '#fff' }]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} />}
      {!!error && (
        <Pressable onPress={() => setRetry((r) => r + 1)} style={styles.error}>
          <Ionicons name="cloud-offline" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{error} Tap to retry.</Text>
        </Pressable>
      )}
      {!loading && !error && meals.length === 0 && <Text style={styles.none}>No meals found.</Text>}

      <View style={styles.grid}>
        {meals.map((m) => (
          <Pressable key={m.id} onPress={() => router.push(`/meal/${m.id}`)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
            <Image source={{ uri: m.image }} style={styles.img} />
            {onMenu(m.id) && <View style={styles.tag}><Ionicons name="checkmark-circle" size={13} color="#fff" /><Text style={styles.tagText}>On menu</Text></View>}
            <Text style={styles.name} numberOfLines={2}>{m.name}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  chips: { gap: 8, paddingVertical: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerSoft, padding: 12, borderRadius: radius.md, marginVertical: 10 },
  errorText: { flex: 1, fontSize: 13, color: colors.danger, fontWeight: '700' },
  none: { textAlign: 'center', color: colors.textMuted, marginVertical: 30, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  card: { width: '47.8%', backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  img: { width: '100%', aspectRatio: 1, backgroundColor: colors.inputBg },
  name: { padding: 10, fontSize: 14, fontWeight: '800', color: colors.text, minHeight: 52 },
  tag: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
