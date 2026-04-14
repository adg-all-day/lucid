// A single transaction card for the list view.
// This was originally renderTransactionCard inside HomeScreen but it makes
// more sense as its own component so we can reuse it or test it in isolation.

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import {
  formatType,
  formatAmount,
  formatShortDate,
  formatClosingDate,
  formatTime,
  getStatusLabel,
  getStatusColor,
  getDaysLeft,
} from '../utils/formatters';

export default function TransactionCard({ item, onPress, useLightText = false }) {
  const theme = useTheme();
  const isDark = theme.isDark;
  const daysLeft = getDaysLeft(item.closing_date);
  const transactionTimestamp = item.last_update || item.created_at;
  const secondaryTextColor = useLightText ? Colors.white : theme.textSecondary;
  const typeTextColor = useLightText ? Colors.white : isDark ? theme.text : Colors.primary60;

  return (
    <View>
      <TouchableOpacity style={styles.transactionCard} onPress={onPress}>
        <View style={styles.transactionRow}>
          {/* Left side: type, description, amount, role, counterparty, closing date */}
          <View style={styles.transactionLeft}>
            <Text
              style={[
                styles.transactionType,
                { color: typeTextColor },
                useLightText && styles.transactionTypeLight,
              ]}
            >
              {formatType(item.type)}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.transactionDesc, { color: secondaryTextColor }]}
            >
              {item.description}
            </Text>
            <Text style={[styles.transactionAmount, { color: secondaryTextColor }]}>
              {formatAmount(item.amount, item.currency)}
            </Text>
            <Text style={[styles.transactionMeta, { color: secondaryTextColor }]}>
              Closing: {formatClosingDate(item.closing_date)}
              {daysLeft !== null ? ` (${daysLeft} days)` : ''}
            </Text>
          </View>

          {/* Right side: created date, time, status badge */}
          <View style={styles.transactionRight}>
            <View>
              <Text style={[styles.dateText, { color: secondaryTextColor }]}>
                {formatShortDate(transactionTimestamp)}
              </Text>
              <Text style={[styles.timeText, { color: secondaryTextColor }]}>
                {formatTime(transactionTimestamp)}
              </Text>
            </View>
            <Text
              style={[
                styles.statusBadge,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={[styles.transactionDivider, { backgroundColor: theme.divider }]} />
    </View>
  );
}

// Styles pulled straight from HomeScreen so the card looks identical
const styles = StyleSheet.create({
  transactionCard: {
    paddingVertical: 14,
  },
  transactionDivider: {
    height: 1,
    backgroundColor: Colors.grayLight,
  },
  transactionRow: {
    flexDirection: 'row',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  transactionType: {
    fontSize: 12,
    color: Colors.primary60,
    fontWeight: '700',
  },
  transactionTypeLight: {
    fontWeight: '700',
  },
  transactionDesc: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 18,
  },
  transactionAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 2,
    lineHeight: 18,
  },
  transactionMeta: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 16,
  },
  dateText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '400',
    textAlign: 'right',
  },
  timeText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '400',
    textAlign: 'right',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'right',
  },
});
