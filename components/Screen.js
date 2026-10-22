import React from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Shared wrapper: SafeAreaView + consistent top padding on Android.
// Used by every screen instead of repeating the same boilerplate.
export default function Screen({ children, style, backgroundColor = '#F4F7F4' }) {
  return (
    <SafeAreaView style={[styles.base, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
