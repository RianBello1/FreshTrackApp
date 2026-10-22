import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function RecipeCard({ recipe, onDelete, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{recipe.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{recipe.category}</Text>
          </View>
        </View>

        <Text style={styles.text}>
          🍽️ Servings: <Text style={styles.boldText}>{recipe.servings}</Text>
        </Text>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(recipe.id)}>
          <Text style={styles.deleteBtnText}>🗑️ Delete Recipe</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#E0E7E0', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  image: { width: '100%', height: 150, backgroundColor: '#E0E7E0' },
  body: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E4620', flexShrink: 1, marginRight: 8 },
  text: { fontSize: 14, color: '#4A5D4E', marginBottom: 4 },
  boldText: { fontWeight: '600', color: '#2E4A32' },
  badge: { backgroundColor: '#D4EDDA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1E4620' },
  deleteBtn: { backgroundColor: '#E57373', paddingVertical: 10, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  deleteBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 }
});
