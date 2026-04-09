import React from 'react';
import { ActivityIndicator } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import TransactionCard from './TransactionCard';

export default function TransactionsListSection({
  isLoading,
  filteredTransactions,
  theme,
  onPressTransaction,
  styles,
}) {
  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={styles.loading}
      />
    );
  }

  if (filteredTransactions.length === 0) {
    return <Text style={[styles.emptyText, { color: theme.text }]}>No transactions found</Text>;
  }

  return filteredTransactions.map((item) => (
    <TransactionCard
      key={item.id}
      item={item}
      onPress={() => onPressTransaction(item.id)}
    />
  ));
}
