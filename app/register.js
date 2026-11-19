import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useThemedStyles, useTheme } from '../context/ThemeContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    const { fullName, email, password, confirmPassword } = form;
    if (!fullName || !email || !password || !confirmPassword) { Alert.alert('Validation Error', 'Please fill in all fields.'); return; }
    if (!email.includes('@') || !email.toLowerCase().endsWith('.com')) { Alert.alert('Invalid Email', 'Email must contain "@" and end with ".com"'); return; }
    if (password !== confirmPassword) { Alert.alert('Password Mismatch', 'Passwords do not match.'); return; }
    const result = await register({ email, password, fullName });
    if (!result.ok) { Alert.alert('Registration Failed', result.error); return; }
    setDone(true);
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Create account" subtitle="Join your kitchen team" />
      <View style={styles.card}>
        <InputField icon="person-outline" label="Full name" placeholder="Jane Doe" value={form.fullName} onChangeText={setField('fullName')} />
        <InputField icon="mail-outline" label="Email" placeholder="you@example.com" keyboardType="email-address" value={form.email} onChangeText={setField('email')} />
        <InputField icon="lock-closed-outline" label="Password" placeholder="Create a password" secureTextEntry value={form.password} onChangeText={setField('password')} />
        <InputField icon="shield-checkmark-outline" label="Confirm password" placeholder="Repeat password" secureTextEntry value={form.confirmPassword} onChangeText={setField('confirmPassword')} />
      </View>
      <View style={styles.note}>
        <Ionicons name="information-circle" size={18} color={colors.primaryMid} />
        <Text style={styles.noteText}>New accounts start as Cook (view stock and mark items used). A manager can upgrade you to Chef or Manager.</Text>
      </View>
      <CustomButton title="Create account" onPress={handleRegister} style={{ marginTop: 10 }} />
      <CustomButton title="Already have an account? Log in" type="ghost" onPress={() => router.push('/')} />
      <ConfirmModal visible={done} icon="checkmark-circle" title="Account created" message="Your account is saved and you're signed in as a Cook. Log in with this email and password anytime." confirmLabel="Continue" hideCancel onConfirm={() => { setDone(false); router.replace('/dashboard'); }} />
    </Screen>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: colors.primarySoft, padding: 12, borderRadius: 14, marginTop: 14 },
  noteText: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600', lineHeight: 18 },
});
