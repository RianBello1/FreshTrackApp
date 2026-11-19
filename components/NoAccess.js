import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from './Screen';
import ScreenHeader from './ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import { useAuth, ROLE_LABEL } from '../context/AuthContext';

export default function NoAccess({ title = 'Restricted' }) {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  return (
    <Screen scroll>
      <ScreenHeader title={title} />
      <View style={{ alignItems: 'center', paddingVertical: 60 }}>
        <View style={{ width: 72, height: 72, borderRadius: 26, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Ionicons name="lock-closed" size={30} color={colors.danger} />
        </View>
        <Text style={{ fontSize: 19, fontWeight: '800', color: colors.text }}>No access</Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 }}>
          {`Your role (${ROLE_LABEL[(currentUser && currentUser.role) || 'cook']}) can't open this. Ask a manager if you need access.`}
        </Text>
      </View>
    </Screen>
  );
}
