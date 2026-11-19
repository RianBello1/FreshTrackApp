import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

export default function ConfirmModal({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false, icon, hideCancel = false, onConfirm, onCancel }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tint = destructive ? colors.danger : colors.primaryMid;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: destructive ? colors.dangerSoft : colors.primarySoft }]}>
            <Ionicons name={icon || (destructive ? 'warning' : 'help-circle')} size={28} color={tint} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.actions}>
            {!hideCancel && (
              <Pressable onPress={onCancel} style={({ pressed }) => [styles.btn, styles.cancel, pressed && { opacity: 0.7 }]}>
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </Pressable>
            )}
            <Pressable onPress={onConfirm} style={({ pressed }) => [styles.btn, { backgroundColor: destructive ? colors.danger : colors.primary }, pressed && { opacity: 0.85 }]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, alignItems: 'center', ...shadow.float },
  iconWrap: { width: 60, height: 60, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: -0.3 },
  message: { fontSize: 14.5, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22, width: '100%' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  cancel: { backgroundColor: colors.inputBg },
  cancelText: { fontSize: 15, fontWeight: '700', color: colors.text },
  confirmText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
