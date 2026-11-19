import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useIngredients } from '../context/IngredientsContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { status, count, reload } = useIngredients();
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter username and password.');
      return;
    }
    const result = await login(email, password);
    if (result.ok) router.replace('/dashboard');
    else Alert.alert('Access Denied', result.error);
  };

  return (
    <Screen scroll backgroundColor="#0C2217" edges={['left', 'right']} barStyle="light-content" contentStyle={{ padding: 0, flexGrow: 1 }}>
      <View style={styles.hero}>
        <View style={[styles.blob, { top: -60, right: -50, width: 220, height: 220 }]} />
        <View style={[styles.blob, { top: 90, left: -70, width: 160, height: 160, opacity: 0.07 }]} />
        <ThemeToggle style={styles.toggle} />
        <View style={styles.logo}><Ionicons name="leaf" size={34} color="#0F3D22" /></View>
        <Text style={styles.brand}>FreshTrack</Text>
        <Text style={styles.tagline}>Kitchen inventory, waste & menu control</Text>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to keep your kitchen fresh.</Text>

        <InputField icon="person-outline" placeholder="Username or email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <InputField icon="lock-closed-outline" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <CustomButton title="Log in" onPress={handleLogin} style={{ marginTop: 14 }} />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New here?</Text>
          <Text style={styles.link} onPress={() => router.push('/register')}>Create an account</Text>
        </View>

        <Pressable onPress={status === 'error' ? reload : undefined} style={styles.catalog}>
          <Ionicons
            name={status === 'ready' ? 'checkmark-circle' : status === 'error' ? 'cloud-offline' : 'cloud-download'}
            size={14} color={status === 'error' ? '#EF4444' : colors.primaryMid}
          />
          <Text style={styles.catalogText}>
            {status === 'ready' ? `Ingredient catalog ready · ${count} ingredients` : status === 'error' ? 'Ingredient catalog offline · tap to retry' : 'Loading ingredient catalog…'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
  hero: { paddingTop: 80, paddingBottom: 60, alignItems: 'center', overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: '#16A34A', opacity: 0.18 },
  toggle: { position: 'absolute', top: 54, right: 20 },
  logo: { width: 76, height: 76, borderRadius: 24, backgroundColor: '#86EFAC', alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...shadow.float },
  brand: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 14, color: '#A7D8B6', marginTop: 4 },
  sheet: { flex: 1, backgroundColor: colors.bg, borderTopLeftRadius: radius.xl + 6, borderTopRightRadius: radius.xl + 6, padding: 26, paddingTop: 32 },
  welcome: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 18 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 18 },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primaryMid, fontSize: 14, fontWeight: '800' },
  catalog: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 26 },
  catalogText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
});
