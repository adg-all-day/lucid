import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../../api/client';
import { extractCollection } from '../../../api/utils/responseParsers';
import { queryKeys } from '../../../constants/queryKeys';
import { CLOSED_STATUSES, OPEN_STATUSES } from '../utils/constants';
import useTransactionFilters from './useTransactionFilters';

export default function useTransactionsHomeViewModel(activeTab, searchText, screenWidth) {
  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: async () => {
      const res = await client.get('/transactions');
      return extractCollection(res);
    },
  });
  const activityQuery = useQuery({
    queryKey: queryKeys.activityLog,
    queryFn: async () => {
      const res = await client.get('/security/activity', { params: { limit: 10 } });
      return extractCollection(res);
    },
  });

  const transactions = transactionsQuery.data ?? [];
  const filteredTransactions = useTransactionFilters(transactions, activeTab, searchText);

  const stats = useMemo(
    () => ({
      all: transactions.length,
      actionRequired: transactions.filter(
        (item) =>
          item.status === 'AWAITING_SIGNATURES' ||
          item.status === 'AWAITING_FUNDS',
      ).length,
      open: transactions.filter((item) => OPEN_STATUSES.includes(item.status)).length,
      closed: transactions.filter((item) => CLOSED_STATUSES.includes(item.status)).length,
    }),
    [transactions],
  );

  return {
    activityQuery,
    transactionsQuery,
    transactions,
    filteredTransactions,
    stats,
    compactActions: screenWidth < 390,
  };
}
