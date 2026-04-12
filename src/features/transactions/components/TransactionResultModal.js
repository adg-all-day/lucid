import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

export default function TransactionResultModal({
  title,
  message,
  theme,
  isDark,
  onClose,
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#2B2B2B' : theme.cardBg,
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E6E6E6',
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

      <TouchableOpacity style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  button: {
    alignSelf: 'flex-end',
    minWidth: 50,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
