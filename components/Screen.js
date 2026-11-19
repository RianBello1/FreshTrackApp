import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function Screen({ children, scroll = false, style, contentStyle, backgroundColor, edges = ['top', 'left', 'right'], barStyle }) {
  const { colors, isDark } = useTheme();
  const body = scroll ? (
    <ScrollView contentContainerStyle={[{ padding: 20, paddingBottom: 48 }, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: backgroundColor || colors.bg }, style]}>
      <StatusBar barStyle={barStyle || (isDark ? 'light-content' : 'dark-content')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
