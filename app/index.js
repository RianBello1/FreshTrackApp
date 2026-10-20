import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Import your custom reusable components
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter username and password.');
      return;
    }

    const ADMIN_USERNAME = 'admin123';
    const ADMIN_PASSWORD = 'admin123';

    if (email.trim().toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      router.replace('/dashboard');
    } else {
      Alert.alert('Access Denied', 'Invalid username or password. Only admin123 / admin123 is allowed.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>FreshTrack</Text>
        <Text style={styles.subtitle}>Smart Inventory & Expiry Tracking</Text>

        <InputField 
          placeholder="Username" 
          value={email} 
          onChangeText={setEmail}
          style={styles.inputSpacing}
        />

        <InputField 
          placeholder="Password" 
          secureTextEntry 
          value={password} 
          onChangeText={setPassword}
          style={styles.inputSpacing}
        />

        <CustomButton 
          title="Login" 
          onPress={handleLogin} 
          style={styles.loginButton}
        />

        <CustomButton 
          title="Don't have an account? Register" 
          type="secondary"
          onPress={() => router.push('/register')} 
          style={styles.registerButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F4F7F4' 
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24 
  },
  title: { 
    fontSize: 34, 
    fontWeight: '800', 
    color: '#1E4620', 
    textAlign: 'center' 
  },
  subtitle: { 
    textAlign: 'center', 
    color: '#668069', 
    marginBottom: 32, 
    fontSize: 14 
  },
  inputSpacing: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
  },
  registerButton: {
    borderColor: 'transparent',
  }
});
