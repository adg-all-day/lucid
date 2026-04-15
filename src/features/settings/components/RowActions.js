// Edit + delete pair used on saved-signature, saved-stamp, passkey,
// secondary-email, and phone-number rows. Kept as one component so the
// icon sizing and error/primary tint stay consistent everywhere.

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';

export default function RowActions({ onEdit, onDelete, style }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.8}
        style={[styles.btn, { backgroundColor: theme.primaryLight }]}
      >
        <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDelete}
        activeOpacity={0.8}
        style={[styles.btn, styles.deleteBtn]}
      >
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: Colors.errorLight,
  },
});
