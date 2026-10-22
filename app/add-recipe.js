import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Import your custom reusable components
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useRecipes } from '../context/RecipeContext';

export default function AddRecipeScreen() {
  const router = useRouter();
  const { addRecipe } = useRecipes();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [servings, setServings] = useState('2');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a recipe name.');
      return;
    }

    const fallbackImage = `https://via.placeholder.com/600x400/4CAF50/FFFFFF.png?text=${encodeURIComponent(name.trim())}`;

    addRecipe({
      id: Date.now().toString(),
      name: name.trim(),
      category: category.trim() || 'General',
      servings: parseInt(servings) || 1,
      description: description.trim(),
      image: image.trim() || fallbackImage,
    });
    router.back();
  };

  const previewImage = image.trim() || `https://via.placeholder.com/600x400/4CAF50/FFFFFF.png?text=${encodeURIComponent(name.trim() || 'Recipe')}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>➕ Add Recipe</Text>
        <Text style={styles.subtitle}>Enter recipe details below</Text>

        <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="cover" />

        <InputField
          label="Recipe Name"
          placeholder="e.g. Chicken Curry"
          value={name}
          onChangeText={setName}
          style={styles.inputSpacing}
        />

        <InputField
          label="Category"
          placeholder="e.g. Main Course, Dessert, Salad..."
          value={category}
          onChangeText={setCategory}
          style={styles.inputSpacing}
        />

        <InputField
          label="Servings"
          keyboardType="numeric"
          placeholder="2"
          value={servings}
          onChangeText={setServings}
          style={styles.inputSpacing}
        />

        <InputField
          label="Description"
          placeholder="Short description of the recipe..."
          value={description}
          onChangeText={setDescription}
          style={styles.inputSpacing}
        />

        <InputField
          label="Image URL (optional)"
          placeholder="https://..."
          value={image}
          onChangeText={setImage}
          style={styles.inputSpacing}
        />

        <CustomButton
          title="Save Recipe"
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
  subtitle: { fontSize: 14, color: '#668069', marginBottom: 16 },
  previewImage: { width: '100%', height: 140, borderRadius: 10, marginBottom: 16, backgroundColor: '#E0E7E0' },
  inputSpacing: { marginBottom: 10 },
  saveBtn: { backgroundColor: '#4CAF50', marginTop: 10 },
  backBtn: { borderColor: 'transparent', marginTop: 4 }
});
