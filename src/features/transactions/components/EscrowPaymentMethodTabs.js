import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

const METHODS = [
  { key: 'bank', label: 'Bank Transfer', icon: 'business-outline' },
  { key: 'card', label: 'Card', icon: 'card-outline' },
  { key: 'wire', label: 'Wire Transfer', icon: 'cash-outline' },
];

export default function EscrowPaymentMethodTabs({ selected, onSelect }) {
  return (
    <View style={styles.row}>
      {METHODS.map((method) => {
        const active = selected === method.key;

        return (
          <TouchableOpacity
            key={method.key}
            style={[styles.tab, active && styles.tabActive]}
            activeOpacity={0.85}
            onPress={() => onSelect(method.key)}
          >
            <Ionicons
              name={method.icon}
              size={14}
              color={active ? Colors.white : 'rgba(255,255,255,0.55)'}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{method.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    height: 30,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.white,
  },
});
