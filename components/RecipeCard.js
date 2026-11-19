import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, categoryStyle, isPlaceholderImage } from '../constants/theme';

export default function RecipeCard({ recipe, onDelete, onPress }) {
  const [imgFailed, setImgFailed] = useState(false);
  const cat = categoryStyle(recipe.category);
  const showImage = !isPlaceholderImage(recipe.image) && !imgFailed;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && onPress && { transform: [{ scale: 0.985 }] }]}>
      {showImage ? (
        <Image source={{ uri: recipe.image }} style={styles.hero} onError={() => setImgFailed(true)} />
      ) : (
        <View style={[styles.hero, { backgroundColor: cat.bg, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name={cat.icon} size={44} color={cat.color} />
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>{recipe.name}</Text>
          <View style={[styles.badge, { backgroundColor: cat.bg }]}>
            <Text style={[styles.badgeText, { color: cat.color }]}>{recipe.category}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.servings}>
            <Ionicons name="people-outline" size={15} color={colors.textMuted} />
            <Text style={styles.servingsText}>{recipe.servings} servings</Text>
          </View>
          <Pressable onPress={() => onDelete(recipe.id)} hitSlop={10} style={styles.delete}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: 14, overflow: 'hidden', ...shadow.card },
  hero: { width: '100%', height: 140 },
  body: { padding: 14, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 12, fontWeight: '800' },
  servings: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  servingsText: { fontSize: 13, color: colors.textMuted },
  delete: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center' },
});
