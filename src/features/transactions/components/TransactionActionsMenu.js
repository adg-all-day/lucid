import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import TransactionVoidIcon from '../../../icons/TransactionVoidIcon';

const ACTION_ITEMS = [
  { key: 'void', label: 'Void Transaction', icon: 'archive-outline' },
  { key: 'cancel', label: 'Cancel Transaction', icon: 'close-circle-outline' },
  { key: 'complete', label: 'Mark as Complete', icon: 'checkmark-circle-outline' },
  { key: 'copy', label: 'Create Copy', icon: 'copy-outline' },
  { key: 'history', label: 'Transaction History', icon: 'time-outline' },
];

export default function TransactionActionsMenu({
  theme,
  isDark,
  onSelectAction,
}) {
  const renderIcon = (item) => {
    const color = isDark ? theme.icon : Colors.text;

    if (item.key === 'void') {
      return <TransactionVoidIcon size={16} color={color} />;
    }

    return <Ionicons name={item.icon} size={18} color={color} />;
  };

  return (
    <View
      style={[
        styles.menu,
        {
          backgroundColor: isDark ? '#2B2B2B' : theme.cardBg,
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E6E6E6',
        },
      ]}
    >
      {ACTION_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.option}
          onPress={() => onSelectAction(item.key)}
        >
          <View style={styles.optionIcon}>{renderIcon(item)}</View>
          <Text style={[styles.optionText, { color: theme.text }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    width: 220,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  optionIcon: {
    marginRight: 10,
    width: 18,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
