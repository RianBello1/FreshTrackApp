import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from './InputField';
import ConfirmModal from './ConfirmModal';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius, categoryStyle } from '../constants/theme';
import { takePhoto, pickPhoto } from '../utils/photo';

// Take a photo, pick one from the gallery, or paste a link.
export default function PhotoField({ label = 'Photo', value, onChange, category }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [linkOpen, setLinkOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const [msg, setMsg] = useState(null);
  const cat = categoryStyle(category);

  const run = async (fn) => {
    const r = await fn();
    if (r.uri) { setBroken(false); onChange(r.uri); }
    else if (r.error === 'MISSING') setMsg({ title: 'Camera not installed', text: 'Run this in your project, then restart the app:\n\nnpx expo install expo-image-picker expo-file-system' });
    else if (r.error === 'DENIED') setMsg({ title: 'Camera permission needed', text: 'Allow camera access for this app in your phone settings, then try again.' });
    else if (r.error) setMsg({ title: 'Could not get photo', text: r.error });
  };

  const hasImage = !!value && !broken;
  return (
    <View style={{ marginVertical: 7 }}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.preview}>
        {hasImage ? (
          <Image source={{ uri: value }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setBroken(true)} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: cat.bg, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="camera-outline" size={34} color={cat.color} />
            <Text style={{ color: cat.color, fontWeight: '700', marginTop: 4, fontSize: 12.5 }}>No photo yet</Text>
          </View>
        )}
        {hasImage && (
          <Pressable onPress={() => onChange('')} style={styles.clear} hitSlop={8}>
            <Ionicons name="close" size={16} color="#fff" />
          </Pressable>
        )}
      </View>
      <View style={styles.row}>
        <Pressable onPress={() => run(takePhoto)} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="camera" size={17} color={colors.primaryMid} /><Text style={styles.btnText}>Camera</Text>
        </Pressable>
        <Pressable onPress={() => run(pickPhoto)} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="images" size={17} color={colors.primaryMid} /><Text style={styles.btnText}>Gallery</Text>
        </Pressable>
        <Pressable onPress={() => setLinkOpen((o) => !o)} style={({ pressed }) => [styles.btn, linkOpen && { backgroundColor: colors.primarySoft }, pressed && { opacity: 0.7 }]}>
          <Ionicons name="link" size={17} color={colors.primaryMid} /><Text style={styles.btnText}>Link</Text>
        </Pressable>
      </View>
      {linkOpen && (
        <InputField icon="link-outline" placeholder="https://..." autoCapitalize="none" value={value && value.startsWith('http') ? value : ''} onChangeText={(t) => { setBroken(false); onChange(t); }} />
      )}
      <ConfirmModal visible={!!msg} icon="camera" title={msg && msg.title} message={msg && msg.text} confirmLabel="OK" hideCancel onConfirm={() => setMsg(null)} />
    </View>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  preview: { width: '100%', height: 150, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.inputBg },
  clear: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: radius.md, backgroundColor: colors.inputBg },
  btnText: { fontSize: 13.5, fontWeight: '800', color: colors.primaryMid },
});
