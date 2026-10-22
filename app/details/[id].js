import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { useInventory } from '../../context/InventoryContext';

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { items, updateItem } = useInventory();

  const item = items.find(i => i.id === String(id));

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item?.name ?? '');
  const [quantity, setQuantity] = useState(item ? String(item.quantity) : '');
  const [category, setCategory] = useState(item?.category ?? '');
  const [expiryDate, setExpiryDate] = useState(item?.expiryDate ?? '');
  const [image, setImage] = useState(item?.image ?? '');

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Item Not Found</Text>
          <Text style={styles.subtitle}>No item exists with ID: {id}</Text>
          <CustomButton title="← Back to Dashboard" type="secondary" onPress={() => router.back()} style={styles.backBtn} />
        </View>
      </SafeAreaView>
    );
  }

  const isExpiring = item.daysLeft <= 2;

  const startEditing = () => {
    setName(item.name);
    setQuantity(String(item.quantity));
    setCategory(item.category);
    setExpiryDate(item.expiryDate);
    setImage(item.image);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name.');
      return;
    }

    updateItem(item.id, {
      name: name.trim(),
      quantity: parseInt(quantity) || 1,
      category: category.trim() || 'General',
      expiryDate: expiryDate.trim(),
      image: image.trim() || item.image,
    });

    setIsEditing(false);
    Alert.alert('Saved', 'Item updated successfully.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Item Details'}</Text>
        <Text style={styles.idText}>ID: {item.id}</Text>

        {isEditing ? (
          <View style={styles.card}>
            <Image source={{ uri: image || item.image }} style={styles.image} resizeMode="cover" />
            <InputField label="Product Name" value={name} onChangeText={setName} style={styles.spacing} />
            <InputField label="Quantity" keyboardType="numeric" value={quantity} onChangeText={setQuantity} style={styles.spacing} />
            <InputField label="Category" value={category} onChangeText={setCategory} style={styles.spacing} />
            <InputField label="Expiration Date" value={expiryDate} onChangeText={setExpiryDate} style={styles.spacing} />
            <InputField label="Image URL" value={image} onChangeText={setImage} style={styles.spacing} />

            <CustomButton title="Save Changes" onPress={handleSave} style={styles.saveBtn} />
            <CustomButton title="Cancel" type="secondary" onPress={() => setIsEditing(false)} style={styles.cancelBtn} />
          </View>
        ) : (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <Text style={styles.name}>{item.name}</Text>

            <View style={[styles.badge, isExpiring ? styles.badgeWarning : styles.badgeSuccess]}>
              <Text style={styles.badgeText}>{isExpiring ? `⚠️ ${item.daysLeft} Days Left` : '✅ Fresh'}</Text>
            </View>

            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>{item.quantity}</Text>

            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{item.category}</Text>

            <Text style={styles.label}>Expiration Date</Text>
            <Text style={styles.value}>{item.expiryDate}</Text>

            <CustomButton title="✏️ Edit Item" onPress={startEditing} style={styles.editBtn} />
          </View>
        )}

        <CustomButton title="← Back to Dashboard" type="secondary" onPress={() => router.back()} style={styles.backBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7F4' },
  container: { padding: 20, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E4620', marginTop: 10 },
  idText: { fontSize: 13, color: '#668069', marginBottom: 16, fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#668069', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#E0E7E0' },
  image: { width: '100%', height: 160, borderRadius: 10, marginBottom: 14, backgroundColor: '#E0E7E0' },
  name: { fontSize: 22, fontWeight: '800', color: '#1E4620', marginBottom: 10 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 14 },
  badgeWarning: { backgroundColor: '#FFF3CD' },
  badgeSuccess: { backgroundColor: '#D4EDDA' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1E4620' },
  label: { fontSize: 12, fontWeight: '700', color: '#527956', marginTop: 10, textTransform: 'uppercase' },
  value: { fontSize: 15, color: '#2E4A32', marginTop: 2 },
  spacing: { marginBottom: 6 },
  editBtn: { backgroundColor: '#4CAF50', marginTop: 16 },
  saveBtn: { backgroundColor: '#4CAF50', marginTop: 8 },
  cancelBtn: { borderColor: 'transparent', marginTop: 2 },
  backBtn: { marginTop: 20, borderColor: '#527956' }
});
