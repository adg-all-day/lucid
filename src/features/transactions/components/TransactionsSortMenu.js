import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import { SORT_FIELD_OPTIONS } from '../utils/constants';

export default function TransactionsSortMenu({
  visible,
  theme,
  sortField,
  sortDirection,
  onClose,
  onSelectSortField,
  onSelectSortDirection,
}) {
  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable
        style={[styles.menu, { backgroundColor: theme.cardBg }]}
        onPress={(event) => event.stopPropagation()}
      >
        <Text style={[styles.title, { color: theme.text }]}>Sort By</Text>
        {SORT_FIELD_OPTIONS.map((option) => {
          const selected = sortField === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                { backgroundColor: selected ? theme.primary10 : 'transparent' },
              ]}
              onPress={() => onSelectSortField(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: theme.text },
                  selected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        <Text style={[styles.title, { color: theme.text }]}>Sort Order</Text>
        {[
          { value: 'asc', label: 'Ascending' },
          { value: 'desc', label: 'Descending' },
        ].map((option) => {
          const selected = sortDirection === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                { backgroundColor: selected ? theme.primary10 : 'transparent' },
              ]}
              onPress={() => onSelectSortDirection(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: theme.text },
                  selected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 11,
  },
  menu: {
    width: 232,
    borderRadius: 12,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignSelf: 'flex-end',
    marginRight: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  option: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 11,
    marginBottom: 6,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextSelected: {
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginTop: 2,
    marginBottom: 12,
  },
});
