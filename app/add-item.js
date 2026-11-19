import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import InputField from '../components/InputField';
import IngredientSuggest from '../components/IngredientSuggest';
import UnitPicker from '../components/UnitPicker';
import DateField from '../components/DateField';
import AllergenChips from '../components/AllergenChips';
import PhotoField from '../components/PhotoField';
import ConfirmModal from '../components/ConfirmModal';
import CustomButton from '../components/CustomButton';
import NoAccess from '../components/NoAccess';
import { useInventory } from '../context/InventoryContext';
import { usePermissions } from '../context/AuthContext';
import { useThemedStyles } from '../context/ThemeContext';
import { validateExpiry } from '../utils/date';
import { detectAllergens } from '../utils/allergens';
import { ingredientImage } from '../utils/mealdb';

export default function AddItemScreen() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { addItem } = useInventory();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [allergens, setAllergens] = useState([]);
  const [touchedAllergens, setTouchedAllergens] = useState(false);
  const [image, setImage] = useState('');
  const [confirming, setConfirming] = useState(false);

  if (!perms.edit) return <NoAccess title="Add item" />;

  const expiry = validateExpiry(expiryDate);

  const changeName = (t) => {
    setName(t);
    if (!touchedAllergens) setAllergens(detectAllergens(t));
  };

  const pickIngredient = (ing) => {
    changeName(ing.name);
    if (!image) setImage(ingredientImage(ing.name, 'medium'));
    if (!category && ing.type) setCategory(ing.type);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a product name.'); return; }
    if (!(parseFloat(quantity) > 0)) { Alert.alert('Error', 'Quantity must be more than 0.'); return; }
    if (expiry.status !== 'valid') { Alert.alert('Expiration date', 'Please enter a complete, real date (numbers only, e.g. 20261130).'); return; }
    setConfirming(true);
  };

  const doSave = () => {
    setConfirming(false);
    addItem({
      id: Date.now().toString(), name: name.trim(), quantity: parseFloat(quantity) || 1, unit,
      category: category.trim() || 'General', costPerUnit: parseFloat(cost) || 0,
      expiryDate: expiryDate.trim(), allergens, image: image.trim(),
    });
    router.back();
  };

  const confirmMessage = expiry.status === 'valid'
    ? `"${name.trim()}" will expire on ${expiry.label} (${expiry.when}).` + (expiry.days < 0 ? '\n\nHeads up: this date has already passed.' : '')
    : '';

  return (
    <Screen scroll>
      <ScreenHeader title="Add item" subtitle="Track new stock" />
      <View style={styles.card}>
        <IngredientSuggest icon="pricetag-outline" label="Product name" placeholder="Start typing, e.g. Salmon" value={name} onChangeText={changeName} onSelect={pickIngredient} showStatus />
        <View style={styles.row}>
          <InputField style={{ flex: 1 }} icon="cube-outline" label="Quantity" keyboardType="decimal-pad" placeholder="1" value={quantity} onChangeText={setQuantity} />
          <InputField style={{ flex: 1.2 }} prefix="₱" label="Cost per unit" keyboardType="decimal-pad" placeholder="0.00" value={cost} onChangeText={setCost} />
        </View>
        <UnitPicker value={unit} onChange={setUnit} />
        <InputField icon="albums-outline" label="Category" placeholder="e.g. Seafood" value={category} onChangeText={setCategory} />
        <DateField value={expiryDate} onChangeText={setExpiryDate} />
        <AllergenChips value={allergens} onChange={(a) => { setTouchedAllergens(true); setAllergens(a); }} />
        <PhotoField label="Photo" value={image} onChange={setImage} category={category} />
      </View>
      <CustomButton title="Save item" icon="checkmark" onPress={handleSave} style={{ marginTop: 10 }} />
      <CustomButton title="Cancel" type="ghost" onPress={() => router.back()} />
      <ConfirmModal visible={confirming} icon="calendar" title="Confirm expiry date" message={confirmMessage} confirmLabel="Yes, add item" cancelLabel="Edit" onConfirm={doSave} onCancel={() => setConfirming(false)} />
    </Screen>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', gap: 12 },
});
