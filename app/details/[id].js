import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import DateField from '../../components/DateField';
import UnitPicker from '../../components/UnitPicker';
import PhotoField from '../../components/PhotoField';
import AllergenChips, { AllergenTags } from '../../components/AllergenChips';
import ConfirmModal from '../../components/ConfirmModal';
import QuantityModal from '../../components/QuantityModal';
import { useInventory } from '../../context/InventoryContext';
import { usePermissions } from '../../context/AuthContext';
import { useThemedStyles, useTheme } from '../../context/ThemeContext';
import { radius, categoryStyle, freshness, isPlaceholderImage } from '../../constants/theme';
import { validateExpiry } from '../../utils/date';
import { money, qtyText } from '../../utils/format';

function InfoTile({ icon, label, value, styles, colors }) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileIcon}><Ionicons name={icon} size={18} color={colors.primaryMid} /></View>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const perms = usePermissions();
  const { items, updateItem, deleteItem, consumeItem, wasteItem } = useInventory();
  const item = items.find((i) => i.id === String(id));

  const [isEditing, setIsEditing] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [trashing, setTrashing] = useState(false);
  const [qtyMode, setQtyMode] = useState(null); // 'used' | 'waste'
  const [f, setF] = useState({});
  const set = (k) => (v) => setF((cur) => ({ ...cur, [k]: v }));

  if (!item) {
    return (
      <Screen scroll>
        <ScreenHeader title="Item not found" subtitle={`No item exists with ID: ${id}`} />
        <CustomButton title="Back to dashboard" type="secondary" icon="arrow-back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const status = freshness(item.daysLeft, colors);
  const cat = categoryStyle(item.category);
  const showImage = !isPlaceholderImage(item.image) && !imgFailed;
  const expiry = validateExpiry(f.expiryDate);

  const startEditing = () => {
    setF({
      name: item.name, quantity: String(item.quantity), unit: item.unit, category: item.category,
      cost: String(item.costPerUnit || ''), expiryDate: item.expiryDate, allergens: item.allergens || [], image: item.image || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!f.name.trim()) { Alert.alert('Error', 'Please enter a product name.'); return; }
    if (!(parseFloat(f.quantity) > 0)) { Alert.alert('Error', 'Quantity must be more than 0.'); return; }
    if (expiry.status !== 'valid') { Alert.alert('Expiration date', 'Please enter a complete, real date (numbers only, e.g. 20261130).'); return; }
    setConfirming(true);
  };

  const doSave = () => {
    setConfirming(false);
    updateItem(item.id, {
      name: f.name.trim(), quantity: parseFloat(f.quantity) || 1, unit: f.unit, category: f.category.trim() || 'General',
      costPerUnit: parseFloat(f.cost) || 0, expiryDate: f.expiryDate.trim(), allergens: f.allergens, image: f.image.trim(),
    });
    setIsEditing(false);
  };

  const confirmMessage = expiry.status === 'valid'
    ? `"${(f.name || '').trim()}" will expire on ${expiry.label} (${expiry.when}).` + (expiry.days < 0 ? '\n\nHeads up: this date has already passed.' : '')
    : '';

  const submitQty = (qty, reason) => {
    const r = qtyMode === 'waste' ? wasteItem(item.id, qty, reason) : consumeItem(item.id, qty);
    setQtyMode(null);
    if (r.ok && r.removed) router.back();
    else if (!r.ok) Alert.alert('Not saved', r.error);
  };

  return (
    <Screen scroll>
      <ScreenHeader title={isEditing ? 'Edit item' : 'Item details'} subtitle={item.name} />

      {isEditing ? (
        <>
          <View style={styles.formCard}>
            <InputField icon="pricetag-outline" label="Product name" value={f.name} onChangeText={set('name')} />
            <View style={styles.row}>
              <InputField style={{ flex: 1 }} icon="cube-outline" label="Quantity" keyboardType="decimal-pad" value={f.quantity} onChangeText={set('quantity')} />
              <InputField style={{ flex: 1.2 }} prefix="₱" label="Cost per unit" keyboardType="decimal-pad" value={f.cost} onChangeText={set('cost')} />
            </View>
            <UnitPicker value={f.unit} onChange={set('unit')} />
            <InputField icon="albums-outline" label="Category" value={f.category} onChangeText={set('category')} />
            <DateField value={f.expiryDate} onChangeText={set('expiryDate')} />
            <AllergenChips value={f.allergens} onChange={set('allergens')} />
            <PhotoField label="Photo" value={f.image} onChange={set('image')} category={f.category} />
          </View>
          <CustomButton title="Save changes" icon="checkmark" onPress={handleSave} style={{ marginTop: 10 }} />
          <CustomButton title="Cancel" type="ghost" onPress={() => setIsEditing(false)} />
        </>
      ) : (
        <>
          <View style={styles.hero}>
            {showImage ? (
              <Image source={{ uri: item.image }} style={styles.heroImg} resizeMode="cover" onError={() => setImgFailed(true)} />
            ) : (
              <View style={[styles.heroImg, { backgroundColor: cat.bg, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name={cat.icon} size={64} color={cat.color} />
              </View>
            )}
            <View style={styles.heroBody}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={[styles.pill, { backgroundColor: status.bg }]}>
                <Ionicons name={status.icon} size={14} color={status.color} />
                <Text style={[styles.pillText, { color: status.color }]}>{status.label}</Text>
              </View>
              <AllergenTags value={item.allergens} />
            </View>
          </View>

          <View style={styles.tiles}>
            <InfoTile styles={styles} colors={colors} icon="cube-outline" label="Quantity" value={qtyText(item.quantity, item.unit)} />
            <InfoTile styles={styles} colors={colors} icon="albums-outline" label="Category" value={item.category} />
            <InfoTile styles={styles} colors={colors} icon="calendar-outline" label="Expires" value={item.expiryDate} />
          </View>
          <View style={styles.tiles}>
            <InfoTile styles={styles} colors={colors} icon="pricetag-outline" label="Cost / unit" value={money(item.costPerUnit || 0)} />
            <InfoTile styles={styles} colors={colors} icon="wallet-outline" label="Stock value" value={money((item.quantity || 0) * (item.costPerUnit || 0))} />
          </View>

          <CustomButton title="Mark as used" icon="checkmark-done" onPress={() => setQtyMode('used')} style={{ marginTop: 18 }} />
          {perms.waste && <CustomButton title="Log waste" type="secondary" icon="flame" onPress={() => setQtyMode('waste')} />}
          {perms.edit && <CustomButton title="Edit item" type="secondary" icon="create-outline" onPress={startEditing} />}
          {perms.trash && <CustomButton title="Move to trash" type="danger" icon="trash-outline" onPress={() => setTrashing(true)} />}
        </>
      )}

      <ConfirmModal visible={confirming} icon="calendar" title="Confirm expiry date" message={confirmMessage} confirmLabel="Yes, save" cancelLabel="Edit" onConfirm={doSave} onCancel={() => setConfirming(false)} />
      <ConfirmModal
        visible={trashing} destructive icon="trash" title="Move to trash?" message="You can restore it from the trash within 30 days." confirmLabel="Move to trash"
        onConfirm={() => { setTrashing(false); deleteItem(item.id); router.back(); }} onCancel={() => setTrashing(false)}
      />
      <QuantityModal visible={!!qtyMode} mode={qtyMode} item={item} onCancel={() => setQtyMode(null)} onSubmit={submitQty} />
    </Screen>
  );
}

const makeStyles = ({ colors, shadow, isDark }) => StyleSheet.create({
  hero: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  heroImg: { width: '100%', height: 190 },
  heroBody: { padding: 18, gap: 10, alignItems: 'flex-start' },
  name: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  pillText: { fontSize: 13, fontWeight: '800' },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 12 },
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...shadow.card },
  tileIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tileLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  tileValue: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 3 },
  formCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', gap: 12 },
});
