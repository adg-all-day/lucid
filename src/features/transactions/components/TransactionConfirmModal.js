import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

export default function TransactionConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  loading = false,
  theme,
  isDark,
  onClose,
  onConfirm,
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

      <View style={styles.actionsRow}>
        {!loading ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.primaryButtonLoading]}
          onPress={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>{confirmLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  secondaryButton: {
    minWidth: 58,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryButtonText: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    minWidth: 72,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonLoading: {
    minWidth: 64,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
