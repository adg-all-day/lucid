import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import { formatAmount, formatClosingDate, formatType } from '../utils/formatters';

export default function EscrowTransferSummaryCard({ transaction, totalDue }) {
  const amount = totalDue || transaction?.amount || 0;
  const description = transaction?.description || '';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.descriptionWrap}>
          <Text style={styles.type}>{formatType(transaction?.type) || 'Transaction'}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        </View>
        <Text style={styles.closingDate}>{formatClosingDate(transaction?.closing_date)}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.amount}>{formatAmount(amount, transaction?.currency, transaction)}</Text>
          <Text style={styles.metaLabel}>Transaction Value</Text>
        </View>
        <View style={styles.closingWrap}>
          <Text style={styles.closingLabel}>Closing Date</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 12,
  },
  descriptionWrap: {
    flex: 1,
    minWidth: 0,
  },
  type: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    color: Colors.white,
    fontSize: 11,
    lineHeight: 15,
  },
  closingDate: {
    color: Colors.white,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
    maxWidth: 150,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amount: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  metaLabel: {
    color: Colors.white,
    fontSize: 9,
  },
  closingWrap: {
    alignItems: 'flex-end',
  },
  closingLabel: {
    color: Colors.white,
    fontSize: 9,
  },
});
