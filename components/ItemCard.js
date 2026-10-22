import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ItemCard({ item, onDelete, onPress }) {
  const isExpiring = item.daysLeft <= 2;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={[styles.badge, isExpiring ? styles.badgeWarning : styles.badgeSuccess]}>
            <Text style={styles.badgeText}>
              {isExpiring ? `⚠️ ${item.daysLeft}d left` : '✅ Fresh'}
            </Text>
          </View>
        </View>

        <Text style={styles.text}>📦 Quantity: <Text style={styles.bold}>{item.quantity}</Text></Text>
        <Text style={styles.text}>🏷️ Category: <Text style={styles.bold}>{item.category}</Text></Text>
        <Text style={styles.text}>📅 Expires: <Text style={styles.bold}>{item.expiryDate}</Text></Text>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteBtnText}>🗑️ Delete Item</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#E0E7E0', overflow: 'hidden' },
  image: { width: '100%', height: 140, backgroundColor: '#E0E7E0' },
  body: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E4620' },
  text: { fontSize: 14, color: '#4A5D4E', marginBottom: 4 },
  bold: { fontWeight: '600', color: '#2E4A32' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeWarning: { backgroundColor: '#FFF3CD' },
  badgeSuccess: { backgroundColor: '#D4EDDA' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1E4620' },
  deleteBtn: { backgroundColor: '#E57373', paddingVertical: 10, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  deleteBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 }
});
