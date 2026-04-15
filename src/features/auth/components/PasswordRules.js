import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/StyledText';
import useTheme from '../../../hooks/useTheme';

export default function PasswordRules({ checks, style }) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.block, style]}>
      {checks.map((check) => (
        <View key={check.key} style={styles.row}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={check.passed ? '#059669' : '#A0A0A0'}
          />
          <Text style={[styles.text, { color: check.passed ? '#059669' : theme.textSecondary }]}>
            {t(`auth.passwordRules.${check.key}`, { defaultValue: check.label })}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: -4,
    marginBottom: 8,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 7,
    fontSize: 11.5,
  },
});
