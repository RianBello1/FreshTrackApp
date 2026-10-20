import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Import your custom reusable components
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
  const [suggestedDays, setSuggestedDays] = useState(7);

  const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const handleNameChange = (text) => {
    setName(text);
    const lower = text.toLowerCase();

    if (lower.includes('egg')) {
      setCategory('Dairy | Storage: Refrigerator');
      const dateStr = getFutureDate(21);
      setExpiryDate(dateStr);
      setSuggestedDays(21);
    } else if (lower.includes('milk')) {
      setCategory('Dairy | Storage: Refrigerator');
      const dateStr = getFutureDate(7);
      setExpiryDate(dateStr);
      setSuggestedDays(7);
    } else if (lower.includes('carrot') || lower.includes('apple')) {
      setCategory('Produce | Storage: Pantry');
      const dateStr = getFutureDate(2);
      setExpiryDate(dateStr);
      setSuggestedDays(2);
    } else {
      setCategory('');
      setExpiryDate(getFutureDate(7));
      setSuggestedDays(7);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name.');
      return;
    }

    addItem({
      id: Date.now().toString(),
      name: name,
      quantity: parseInt(quantity) || 1,
      category: category || 'General',
      expiryDate: expiryDate || getFutureDate(7),
      daysLeft: suggestedDays
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>➕ Add Inventory Item</Text>
        <Text style={styles.subtitle}>Enter item details below</Text>
        
        <InputField 
          label="Product Name"
          placeholder="Try typing 'Egg', 'Milk', or 'Carrots'..." 
          value={name} 
          onChangeText={handleNameChange} 
          style={styles.inputSpacing}
        />
        
        {category ? (
          <View style={styles.infoContainer}>
            <Text style={styles.infoBox}>Product Info: {category}</Text>
            <Text style={styles.suggestedText}>Suggested Expiry: {expiryDate} ({suggestedDays} days shelf life)</Text>
          </View>
        ) : null}

        <InputField 
          label="Quantity"
          keyboardType="numeric" 
          placeholder="1" 
          value={quantity} 
          onChangeText={setQuantity} 
          style={styles.inputSpacing}
        />

        <InputField 
          label="Expiration Date (YYYY-MM-DD)"
          placeholder="YYYY-MM-DD" 
          value={expiryDate} 
          onChangeText={setExpiryDate} 
          style={styles.inputSpacing}
        />

        <CustomButton 
          title="Save Item" 
          onPress={handleSave} 
          style={styles.saveBtn}
        />
        
        <CustomButton 
          title="← Back to Dashboard" 
          type="secondary"
          onPress={() => router.back()} 
          style={styles.backBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E4620', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#668069', marginBottom: 20 },
  inputSpacing: { marginBottom: 10 },
  infoContainer: { backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8, marginBottom: 16 },
  infoBox: { color: '#1B5E20', fontSize: 13, fontWeight: '600' },
  suggestedText: { color: '#2E7D32', fontSize: 12, marginTop: 4 },
  saveBtn: { backgroundColor: '#4CAF50', marginTop: 10 },
  backBtn: { borderColor: 'transparent', marginTop: 4 }
});
