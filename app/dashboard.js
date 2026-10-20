import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Import your custom reusable components
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import ItemCard from '../components/ItemCard';
import { useInventory } from '../context/InventoryContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { items, deleteItem } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic status counting
  const freshCount = items.filter(i => i.daysLeft > 2).length;
  const expiringCount = items.filter(i => i.daysLeft >= 0 && i.daysLeft <= 2).length;

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F4" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>FreshTrack</Text>
            <Text style={styles.subLogo}>Mobile Inventory</Text>
          </View>
          <View style={styles.headerActions}>
            <CustomButton 
              title="+ Add Item" 
              onPress={() => router.push('/add-item')} 
              style={styles.addBtn}
            />
            <CustomButton 
              title="Logout" 
              type="secondary"
              onPress={() => router.replace('/')} 
              style={styles.logoutBtn}
            />
          </View>
        </View>

        {/* Dynamic Dashboard Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{items.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{freshCount}</Text>
            <Text style={styles.statLabel}>Fresh</Text>
          </View>
          <CustomButton 
            title={`${expiringCount}\nExpiring ➔`} 
            type="secondary"
            onPress={() => router.push('/expiring-soon')} 
            style={[styles.statCard, styles.activeStatCard]}
          />
        </View>

        {/* Inventory Section */}
        <Text style={styles.sectionTitle}>📋 Inventory Items</Text>
        
        <InputField 
          placeholder="Search items by name or category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchContainer}
        />

        {filteredItems.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onDelete={deleteItem}
            onPress={() => router.push(`/details/${item.id}`)}
          />
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F7F4', 
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 20 
  },
  scrollContainer: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  logo: { fontSize: 26, fontWeight: '800', color: '#1E4620' },
  subLogo: { fontSize: 12, color: '#527956', fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: { 
    backgroundColor: '#4CAF50', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    marginVertical: 0 
  },
  logoutBtn: { 
    backgroundColor: '#E2EBE2', 
    borderColor: 'transparent',
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    marginVertical: 0 
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 10, 
    borderRadius: 12, 
    alignItems: 'center', 
    flex: 1, 
    marginHorizontal: 4, 
    borderWidth: 1, 
    borderColor: '#E0E7E0',
    marginVertical: 0,
    height: 75,
    justifyContent: 'center'
  },
  activeStatCard: { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#2E7D32' },
  statLabel: { fontSize: 11, color: '#4A5D4E', marginTop: 2, fontWeight: '600', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E4620', marginTop: 10, marginBottom: 12 },
  searchContainer: { marginBottom: 16 }
});
