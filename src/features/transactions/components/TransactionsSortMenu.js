import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  if (!visible) return null;

  const menuBackgroundColor = theme.isDark ? '#2B2B2B' : theme.cardBg;
  const dividerColor = theme.isDark ? 'rgba(255,255,255,0.12)' : '#E6E6E6';
  const menuBorderColor = theme.isDark ? 'rgba(255,255,255,0.08)' : '#E6E6E6';

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable
        style={[styles.menu, { backgroundColor: menuBackgroundColor, borderColor: menuBorderColor }]}
        onPress={(event) => event.stopPropagation()}
      >
        <Text style={[styles.title, { color: theme.text }]}>{t('transactions.sort.title')}</Text>
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
                {t(option.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <Text style={[styles.title, { color: theme.text }]}>{t('transactions.sort.order')}</Text>
        {[
          { value: 'asc', labelKey: 'transactions.sort.ascending' },
          { value: 'desc', labelKey: 'transactions.sort.descending' },
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
                {t(option.labelKey)}
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
