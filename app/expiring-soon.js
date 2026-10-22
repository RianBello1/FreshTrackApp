import React from 'react';
import { Text, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import CustomButton from '../components/CustomButton';
import ItemCard from '../components/ItemCard';
import { useInventory } from '../context/InventoryContext';

export default function ExpiringSoonScreen() {
  const router = useRouter();
  const { items, deleteItem } = useInventory();

  const expiringItems = items.filter(item => item.daysLeft <= 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>⏰ Items Expiring Soon</Text>

        {expiringItems.length === 0 ? (
          <Text style={styles.empty}>No items currently expiring soon.</Text>
        ) : (
          expiringItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={deleteItem}
              onPress={() => router.push(`/details/${item.id}`)}
            />
          ))
        )}

        <CustomButton title="← Back to Dashboard" type="secondary" onPress={() => router.back()} style={styles.backBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7F4', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#D32F2F', marginVertical: 20 },
  empty: { textAlign: 'center', color: '#888', marginVertical: 30, fontSize: 15 },
  backBtn: { marginTop: 20, borderColor: '#527956' }
});
