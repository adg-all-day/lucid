import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import client from '../../../api/client';
import { extractCollection } from '../../../api/utils/responseParsers';
import { queryKeys } from '../../../constants/queryKeys';
import { CLOSED_STATUSES, OPEN_STATUSES } from '../utils/constants';

const TRANSACTIONS_PAGE_SIZE = 10;

function formatDateParam(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRangeParams(dateFilter, customRange) {
  if (dateFilter === 'all') return {};

  const now = new Date();
  const endDate = formatDateParam(now);
  const start = new Date(now);

  if (dateFilter === '24h') {
    start.setDate(start.getDate() - 1);
    return { startDate: formatDateParam(start), endDate };
  }

  if (dateFilter === '7d') {
    start.setDate(start.getDate() - 7);
    return { startDate: formatDateParam(start), endDate };
  }

  if (dateFilter === '30d') {
    start.setDate(start.getDate() - 30);
    return { startDate: formatDateParam(start), endDate };
  }

  if (dateFilter === '6m') {
    start.setMonth(start.getMonth() - 6);
    return { startDate: formatDateParam(start), endDate };
  }

  if (dateFilter === '12m') {
    start.setFullYear(start.getFullYear() - 1);
    return { startDate: formatDateParam(start), endDate };
  }

  if (dateFilter === 'custom' && customRange?.start && customRange?.end) {
    return {
      startDate: formatDateParam(new Date(customRange.start)),
      endDate: formatDateParam(new Date(customRange.end)),
    };
  }

  return {};
}

function getTabRequestParams(activeTab, baseParams) {
  if (activeTab === 'All Transactions') {
    return baseParams;
  }

  if (activeTab === 'Action Required') {
    return { ...baseParams, list_type: 'action_required' };
  }

  if (activeTab === 'Open') {
    return { ...baseParams, list_type: 'open' };
  }

  if (activeTab === 'Closed') {
    return { ...baseParams, list_type: 'closed' };
  }

  return baseParams;
}

function getSortFieldValue(transaction, sortField) {
  switch (sortField) {
    case 'type':
      return String(transaction.type || '').toLowerCase();
    case 'description':
      return String(transaction.description || '').toLowerCase();
    case 'amount':
      return Number(transaction.amount || 0);
    case 'closing_date':
      return new Date(transaction.closing_date || 0).getTime();
    case 'created_at':
      return new Date(transaction.created_at || 0).getTime();
    case 'status':
      return String(transaction.status || '').toLowerCase();
    default:
      return new Date(transaction.last_update || transaction.created_at || 0).getTime();
  }
}

function sortTransactions(transactions, sortField, sortDirection) {
  return [...transactions].sort((left, right) => {
    const leftValue = getSortFieldValue(left, sortField);
    const rightValue = getSortFieldValue(right, sortField);

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return sortDirection === 'asc' ? leftValue - rightValue : rightValue - leftValue;
    }

    const comparison = String(leftValue).localeCompare(String(rightValue));
    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

export default function useTransactionsHomeViewModel(
  activeTab,
  searchText,
  screenWidth,
  dateFilter,
  customRange,
  sortField,
  sortDirection,
) {
  const transactionParams = useMemo(
    () => ({
      ...(searchText ? { search: searchText } : {}),
      ...getDateRangeParams(dateFilter, customRange),
      sortBy: sortField,
      sortOrder: sortDirection,
      timezone: 'Africa/Lagos',
    }),
    [searchText, dateFilter, customRange, sortField, sortDirection],
  );

  const tabRequestParams = useMemo(
    () => getTabRequestParams(activeTab, transactionParams),
    [activeTab, transactionParams],
  );

  const tabQuery = useInfiniteQuery({
    queryKey: queryKeys.transactions(tabRequestParams),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await client.get('/transactions', {
        params: {
          ...tabRequestParams,
          limit: TRANSACTIONS_PAGE_SIZE,
          offset: pageParam,
        },
      });
      const payload = res?.data ?? {};

      return {
        items: extractCollection(res),
        totalFilteredRecords: payload.total_filtered_records ?? payload.totalFilteredRecords ?? 0,
        nextOffset: pageParam + TRANSACTIONS_PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage) => {
      const loadedCount = lastPage.nextOffset;
      return loadedCount < lastPage.totalFilteredRecords ? loadedCount : undefined;
    },
  });

  const allTransactionsQuery = useQuery({
    queryKey: queryKeys.transactions(),
    queryFn: async () => {
      const res = await client.get('/transactions');
      return extractCollection(res);
    },
  });
  const filteredTransactions = useMemo(() => {
    const deduped = new Map();

    tabQuery.data?.pages?.forEach((page) => {
      (page.items ?? []).forEach((transaction) => {
        deduped.set(transaction.id, transaction);
      });
    });

    return sortTransactions(Array.from(deduped.values()), sortField, sortDirection);
  }, [tabQuery.data, sortField, sortDirection]);

  const transactionsQuery = useMemo(
    () => ({
      data: filteredTransactions,
      isLoading: tabQuery.isLoading,
      isRefetching: tabQuery.isRefetching,
      isFetchingNextPage: tabQuery.isFetchingNextPage,
      hasNextPage: tabQuery.hasNextPage,
      fetchNextPage: tabQuery.fetchNextPage,
      refetch: tabQuery.refetch,
    }),
    [filteredTransactions, tabQuery],
  );

  const allTransactions = allTransactionsQuery.data ?? [];

  const stats = useMemo(
    () => ({
      all: allTransactions.length,
      actionRequired: allTransactions.filter(
        (item) =>
          item.status === 'AWAITING_SIGNATURES' ||
          item.status === 'AWAITING_FUNDS',
      ).length,
      open: allTransactions.filter((item) => OPEN_STATUSES.includes(item.status)).length,
      closed: allTransactions.filter((item) => CLOSED_STATUSES.includes(item.status)).length,
    }),
    [allTransactions],
  );

  return {
    transactionsQuery,
    filteredTransactions,
    stats,
    compactActions: screenWidth < 390,
  };
}
