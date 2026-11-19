import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { WASTE_REASONS } from '../context/InventoryContext';
import { radius } from '../constants/theme';
import { money, qtyText } from '../utils/format';

// mode: 'used' | 'waste'. onSubmit(quantity, reason)
export default function QuantityModal({ visible, mode, item, onSubmit, onCancel }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [qty, setQty] = useState('1');
  const [reason, setReason] = useState('Spoiled');

  useEffect(() => {
    if (visible && item) {
      setQty(item.quantity >= 1 ? '1' : String(item.quantity));
      setReason(item.daysLeft < 0 ? 'Expired' : 'Spoiled');
    }
  }, [visible]);

  if (!item) return null;
  const isWaste = mode === 'waste';
  const n = parseFloat(qty);
  const valid = n > 0 && n <= item.quantity + 1e-9;
  const step = item.unit === 'kg' || item.unit === 'L' ? 0.5 : 1;
  const bump = (d) => {
    const cur = parseFloat(qty) || 0;
    const next = Math.min(item.quantity, Math.max(0, Math.round((cur + d) * 100) / 100));
    setQty(String(next));
  };
  const tint = isWaste ? colors.danger : colors.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <View style={[styles.icon, { backgroundColor: isWaste ? colors.dangerSoft : colors.primarySoft }]}>
            <Ionicons name={isWaste ? 'flame' : 'checkmark-done'} size={26} color={tint} />
          </View>
          <Text style={styles.title}>{isWaste ? 'Log waste' : 'Mark as used'}</Text>
          <Text style={styles.sub}>{item.name} · {qtyText(item.quantity, item.unit)} available</Text>

          <View style={styles.stepper}>
            <Pressable onPress={() => bump(-step)} style={styles.stepBtn}><Ionicons name="remove" size={22} color={colors.text} /></Pressable>
            <TextInput style={styles.qtyInput} value={qty} onChangeText={setQty} keyboardType="decimal-pad" selectTextOnFocus />
            <Text style={styles.unit}>{item.unit}</Text>
            <Pressable onPress={() => bump(step)} style={styles.stepBtn}><Ionicons name="add" size={22} color={colors.text} /></Pressable>
          </View>
          <Pressable onPress={() => setQty(String(item.quantity))}><Text style={styles.all}>Use all ({qtyText(item.quantity, item.unit)})</Text></Pressable>

          {isWaste && (
            <>
              <Text style={styles.sectionLabel}>Reason</Text>
              <View style={styles.reasons}>
                {WASTE_REASONS.map((r) => (
                  <Pressable key={r} onPress={() => setReason(r)} style={[styles.reason, reason === r && { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: reason === r ? colors.danger : colors.textMuted }}>{r}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.cost}>Loss: <Text style={{ color: colors.danger, fontWeight: '900' }}>{money(valid ? n * (item.costPerUnit || 0) : 0)}</Text></Text>
            </>
          )}
          {!valid && <Text style={styles.err}>Enter a quantity between 0 and {item.quantity}.</Text>}

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.btn, { backgroundColor: colors.inputBg }]}><Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text></Pressable>
            <Pressable disabled={!valid} onPress={() => onSubmit(Math.round(n * 100) / 100, reason)} style={[styles.btn, { backgroundColor: tint }, !valid && { opacity: 0.4 }]}>
              <Text style={[styles.btnText, { color: '#fff' }]}>{isWaste ? 'Log waste' : 'Mark used'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 390, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 22, alignItems: 'center', ...shadow.float },
  icon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: 16, textAlign: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { minWidth: 80, textAlign: 'center', fontSize: 28, fontWeight: '900', color: colors.text, paddingVertical: 4 },
  unit: { fontSize: 15, fontWeight: '800', color: colors.textMuted, marginRight: 4 },
  all: { fontSize: 13, fontWeight: '800', color: colors.primaryMid, marginTop: 10 },
  sectionLabel: { alignSelf: 'flex-start', fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignSelf: 'flex-start' },
  reason: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: 'transparent' },
  cost: { fontSize: 14, color: colors.textMuted, marginTop: 14, fontWeight: '700' },
  err: { fontSize: 12.5, color: colors.danger, marginTop: 10, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '800' },
});
