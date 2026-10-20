import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ItemCard({ item, onDelete, onPress }) {
  const isExpiring = item.daysLeft <= 2;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={[styles.badge, isExpiring ? styles.badgeWarning : styles.badgeSuccess]}>
          <Text style={styles.badgeText}>
            {isExpiring ? `⚠️ ${item.daysLeft} Days Left` : ' Fresh'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.text}>📦 Quantity: <Text style={styles.boldText}>{item.quantity}</Text></Text>
      <Text style={styles.text}>🏷️ Category: <Text style={styles.boldText}>{item.category || 'General'}</Text></Text>
      <Text style={styles.text}>📅 Expires: <Text style={styles.boldText}>{item.expiryDate}</Text></Text>

      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
        <Text style={styles.deleteBtnText}>🗑️ Delete Item</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#E0E7E0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E4620' },
  text: { fontSize: 14, color: '#4A5D4E', marginBottom: 4 },
  boldText: { fontWeight: '600', color: '#2E4A32' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeWarning: { backgroundColor: '#FFF3CD' },
  badgeSuccess: { backgroundColor: '#D4EDDA' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1E4620' },
  deleteBtn: { backgroundColor: '#E57373', paddingVertical: 10, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  deleteBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 }
});