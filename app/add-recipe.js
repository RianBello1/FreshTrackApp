import React, { useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import InputField from '../components/InputField';
import IngredientSuggest from '../components/IngredientSuggest';
import AllergenChips from '../components/AllergenChips';
import PhotoField from '../components/PhotoField';
import CustomButton from '../components/CustomButton';
import NoAccess from '../components/NoAccess';
import { useMenu } from '../context/MenuContext';
import { usePermissions } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';
import { detectAll } from '../utils/allergens';

// Add your own signature dish (separate from dishes imported from TheMealDB).
export default function AddDishScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { addDish } = useMenu();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [servings, setServings] = useState('1');
  const [instructions, setInstructions] = useState('');
  const [ingText, setIngText] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [allergens, setAllergens] = useState([]);
  const [touched, setTouched] = useState(false);
  const [image, setImage] = useState('');
  const [enabled, setEnabled] = useState(true);

  if (!perms.menu) return <NoAccess title="Add dish" />;

  const refreshAllergens = (list) => { if (!touched) setAllergens(detectAll(list.map((i) => i.name))); };
  const addIngredient = (n) => {
    const clean = (n || '').trim();
    if (!clean || ingredients.some((i) => i.name.toLowerCase() === clean.toLowerCase())) { setIngText(''); return; }
    const next = [...ingredients, { name: clean, measure: '' }];
    setIngredients(next); setIngText(''); refreshAllergens(next);
  };
  const removeIngredient = (n) => {
    const next = ingredients.filter((i) => i.name !== n);
    setIngredients(next); refreshAllergens(next);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a dish name.'); return; }
    if (ingredients.length === 0) { Alert.alert('Ingredients', 'Add at least one ingredient so the app can match it to your stock.'); return; }
    const r = addDish({
      source: 'custom', name: name.trim(), category: category.trim() || 'General', servings: parseInt(servings) || 1,
      instructions: instructions.trim(), image: image.trim(), ingredients, allergens, enabled,
    });
    if (!r.ok) { Alert.alert('Not saved', r.error); return; }
    router.back();
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Add dish" subtitle="Your own recipe for the menu" />
      <View style={styles.card}>
        <InputField icon="restaurant-outline" label="Dish name" placeholder="e.g. Pan-seared Salmon" value={name} onChangeText={setName} />
        <View style={styles.row}>
          <InputField style={{ flex: 1.4 }} icon="albums-outline" label="Category" placeholder="e.g. Seafood" value={category} onChangeText={setCategory} />
          <InputField style={{ flex: 1 }} icon="people-outline" label="Servings" keyboardType="numeric" placeholder="1" value={servings} onChangeText={setServings} />
        </View>

        <IngredientSuggest label="Ingredients" icon="nutrition-outline" placeholder="Search and tap to add" value={ingText} onChangeText={setIngText} onSelect={(ing) => addIngredient(ing.name)} onSubmit={() => addIngredient(ingText)} showStatus />
        <View style={styles.chips}>
          {ingredients.map((i) => (
            <Pressable key={i.name} onPress={() => removeIngredient(i.name)} style={styles.chip}>
              <Text style={styles.chipText}>{i.name}</Text>
              <Ionicons name="close" size={14} color={colors.primaryMid} />
            </Pressable>
          ))}
        </View>
        {ingText.trim().length > 0 && (
          <Pressable onPress={() => addIngredient(ingText)} style={styles.addCustom}>
            <Ionicons name="add" size={16} color={colors.primaryMid} />
            <Text style={styles.addCustomText}>Add "{ingText.trim()}" as typed</Text>
          </Pressable>
        )}

        <AllergenChips value={allergens} onChange={(a) => { setTouched(true); setAllergens(a); }} />
        <InputField icon="document-text-outline" label="Method (optional)" placeholder="Short description or steps..." multiline value={instructions} onChangeText={setInstructions} />
        <PhotoField label="Photo of the dish" value={image} onChange={setImage} category={category} />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Serve on the menu now</Text>
            <Text style={styles.switchSub}>You can turn this on or off later.</Text>
          </View>
          <Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
        </View>
      </View>
      <CustomButton title="Save dish" icon="checkmark" onPress={handleSave} style={{ marginTop: 10 }} />
      <CustomButton title="Cancel" type="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  chipText: { fontSize: 13, fontWeight: '800', color: colors.primaryMid },
  addCustom: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  addCustomText: { fontSize: 13, fontWeight: '800', color: colors.primaryMid },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  switchTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  switchSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
});
