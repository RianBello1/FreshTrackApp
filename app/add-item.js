import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useInventory } from '../context/InventoryContext';

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem } = useInventory();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [image, setImage] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name.');
      return;
    }

    addItem({
      id: Date.now().toString(),
      name: name.trim(),
      quantity: parseInt(quantity) || 1,
      category: category.trim() || 'General',
      expiryDate: expiryDate.trim() || 'N/A',
      daysLeft: 7,
      image: image.trim() || `https://via.placeholder.com/600x400/4CAF50/FFFFFF.png?text=${encodeURIComponent(name.trim())}`,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>➕ Add Inventory Item</Text>

        <InputField label="Product Name" placeholder="e.g. Carrots" value={name} onChangeText={setName} style={styles.spacing} />
        <InputField label="Quantity" keyboardType="numeric" placeholder="1" value={quantity} onChangeText={setQuantity} style={styles.spacing} />
        <InputField label="Category" placeholder="e.g. Vegetable" value={category} onChangeText={setCategory} style={styles.spacing} />
        <InputField label="Expiration Date (YYYY-MM-DD)" placeholder="YYYY-MM-DD" value={expiryDate} onChangeText={setExpiryDate} style={styles.spacing} />
        <InputField label="Image URL (optional)" placeholder="https://..." value={image} onChangeText={setImage} style={styles.spacing} />

        <CustomButton title="Save Item" onPress={handleSave} style={styles.saveBtn} />
        <CustomButton title="← Back to Dashboard" type="secondary" onPress={() => router.back()} style={styles.backBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E4620', marginTop: 10, marginBottom: 20 },
  spacing: { marginBottom: 10 },
  saveBtn: { backgroundColor: '#4CAF50', marginTop: 10 },
  backBtn: { borderColor: 'transparent', marginTop: 4 }
});
