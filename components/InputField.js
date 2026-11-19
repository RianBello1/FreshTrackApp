import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles, useTheme } from '../context/ThemeContext';
import { radius } from '../constants/theme';

export default function InputField({
  label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default',
  autoCapitalize = 'sentences', multiline = false, maxLength, icon, style, prefix, onFocus, onBlur, onSubmitEditing,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);
  return (
    <View style={[styles.container, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.field, focused && styles.fieldFocused, multiline && { alignItems: 'flex-start' }]}>
        {!!icon && <Ionicons name={icon} size={19} color={focused ? colors.primary : colors.textMuted} style={multiline && { marginTop: 14 }} />}
        {!!prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, multiline && { minHeight: 90, textAlignVertical: 'top' }]}
          value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden} keyboardType={keyboardType} maxLength={maxLength} multiline={multiline}
          autoCapitalize={secureTextEntry || keyboardType === 'email-address' ? 'none' : autoCapitalize}
          onFocus={() => { setFocused(true); onFocus && onFocus(); }}
          onBlur={() => { setFocused(false); onBlur && onBlur(); }}
          onSubmitEditing={onSubmitEditing}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const makeStyles = ({ colors }) => StyleSheet.create({
  container: { marginVertical: 7, width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 7, letterSpacing: 0.2 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: 'transparent', borderRadius: radius.md, paddingHorizontal: 14 },
  fieldFocused: { backgroundColor: colors.surface, borderColor: colors.primary },
  prefix: { fontSize: 16, fontWeight: '800', color: colors.textMuted },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
});
