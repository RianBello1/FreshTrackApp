import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Import your custom reusable components
import Screen from '../components/Screen';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useInventory } from '../context/InventoryContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerAccount } = useInventory();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = () => {
    const { fullName, email, password, confirmPassword } = form;

    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    // Email validation rule: must contain '@' and '.com'
    if (!email.includes('@') || !email.toLowerCase().endsWith('.com')) {
      Alert.alert('Invalid Email', 'Email must contain "@" and end with ".com"');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    registerAccount({ email: email.toLowerCase(), password, fullName });
    Alert.alert('Success', 'Account created successfully!', [
      { text: 'OK', onPress: () => router.replace('/dashboard') }
    ]);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join FreshTrack today</Text>

        <InputField placeholder="Full Name" value={form.fullName} onChangeText={setField('fullName')} style={styles.inputSpacing} />
        <InputField placeholder="Email Address" keyboardType="email-address" value={form.email} onChangeText={setField('email')} style={styles.inputSpacing} />
        <InputField placeholder="Password" secureTextEntry value={form.password} onChangeText={setField('password')} style={styles.inputSpacing} />
        <InputField placeholder="Confirm Password" secureTextEntry value={form.confirmPassword} onChangeText={setField('confirmPassword')} style={styles.inputSpacing} />

        <CustomButton title="Register Account" onPress={handleRegister} style={styles.registerButton} />
        <CustomButton
          title="Already have an account? Login"
          type="secondary"
          onPress={() => router.push('/')}
          style={styles.loginLinkButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E4620',
    textAlign: 'center'
  },
  subtitle: {
    textAlign: 'center',
    color: '#668069',
    marginBottom: 24
  },
  inputSpacing: {
    marginBottom: 10,
  },
  registerButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
  },
  loginLinkButton: {
    borderColor: 'transparent',
  }
});
