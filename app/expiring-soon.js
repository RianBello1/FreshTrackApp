import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import ItemCard from '../components/ItemCard';
import CustomButton from '../components/CustomButton';
import QuantityModal from '../components/QuantityModal';
import { useInventory } from '../context/InventoryContext';
import { usePermissions } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { EXPIRING_DAYS } from '../constants/theme';
import { money } from '../utils/format';

export default function ExpiringSoonScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { items, stats, deleteItem, consumeItem } = useInventory();
  const perms = usePermissions();
  const [useTarget, setUseTarget] = useState(null);
  const expiring = items.filter((i) => i.daysLeft <= EXPIRING_DAYS).sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <Screen scroll>
      <ScreenHeader title="Expiring soon" subtitle={`Within ${EXPIRING_DAYS} days · ${money(stats.expiringValue)} at risk`} />
      {expiring.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Ionicons name="checkmark-done" size={32} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>All clear</Text>
          <Text style={styles.emptyText}>No items currently expiring soon.</Text>
        </View>
      ) : (
        <>
          <CustomButton title="Suggest dishes for these" icon="sparkles" onPress={() => router.push('/specials')} style={{ marginTop: 0, marginBottom: 14 }} />
          {expiring.map((item) => (
            <ItemCard key={item.id} item={item} onPress={() => router.push(`/details/${item.id}`)} onUse={setUseTarget} onDelete={perms.trash ? deleteItem : undefined} />
          ))}
        </>
      )}
      <QuantityModal visible={!!useTarget} mode="used" item={useTarget} onCancel={() => setUseTarget(null)} onSubmit={(qty) => { consumeItem(useTarget.id, qty); setUseTarget(null); }} />
    </Screen>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyIcon: { width: 72, height: 72, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
});
