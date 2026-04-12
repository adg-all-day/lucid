import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../../api/client';
import { extractCollection } from '../../../api/utils/responseParsers';
import { queryKeys } from '../../../constants/queryKeys';
import useActivityLogQuery from './useActivityLogQuery';

function readTotalCount(response) {
  const payload = response?.data ?? {};
  return payload.total_filtered_records ?? payload.totalFilteredRecords ?? extractCollection(response).length;
}

export default function useDashboardHomeViewModel() {
  const allCountQuery = useQuery({
    queryKey: queryKeys.transactions({ scope: 'dashboard-count', list_type: 'all' }),
    queryFn: async () => {
      const res = await client.get('/transactions', { params: { limit: 1, offset: 0 } });
      return readTotalCount(res);
    },
  });

  const actionRequiredCountQuery = useQuery({
    queryKey: queryKeys.transactions({ scope: 'dashboard-count', list_type: 'action_required' }),
    queryFn: async () => {
      const res = await client.get('/transactions', {
        params: { list_type: 'action_required', limit: 1, offset: 0 },
      });
      return readTotalCount(res);
    },
  });

  const openCountQuery = useQuery({
    queryKey: queryKeys.transactions({ scope: 'dashboard-count', list_type: 'open' }),
    queryFn: async () => {
      const res = await client.get('/transactions', {
        params: { list_type: 'open', limit: 1, offset: 0 },
      });
      return readTotalCount(res);
    },
  });

  const closedCountQuery = useQuery({
    queryKey: queryKeys.transactions({ scope: 'dashboard-count', list_type: 'closed' }),
    queryFn: async () => {
      const res = await client.get('/transactions', {
        params: { list_type: 'closed', limit: 1, offset: 0 },
      });
      return readTotalCount(res);
    },
  });

  const recentTransactionsQuery = useQuery({
    queryKey: queryKeys.transactions({ scope: 'dashboard-recent', sortBy: 'created_at', sortOrder: 'desc', limit: 3 }),
    queryFn: async () => {
      const res = await client.get('/transactions', {
        params: {
          sortBy: 'created_at',
          sortOrder: 'desc',
          limit: 3,
          offset: 0,
          timezone: 'Africa/Lagos',
        },
      });
      return extractCollection(res);
    },
  });

  const recentActivityQuery = useActivityLogQuery({ limit: 3 });

  const stats = useMemo(
    () => ({
      all: allCountQuery.data ?? 0,
      actionRequired: actionRequiredCountQuery.data ?? 0,
      open: openCountQuery.data ?? 0,
      closed: closedCountQuery.data ?? 0,
    }),
    [
      allCountQuery.data,
      actionRequiredCountQuery.data,
      openCountQuery.data,
      closedCountQuery.data,
    ],
  );

  const isLoading =
    allCountQuery.isLoading ||
    actionRequiredCountQuery.isLoading ||
    openCountQuery.isLoading ||
    closedCountQuery.isLoading ||
    recentTransactionsQuery.isLoading ||
    recentActivityQuery.isLoading;

  return {
    isLoading,
    stats,
    recentTransactions: recentTransactionsQuery.data ?? [],
    recentActivity: recentActivityQuery.data ?? [],
    recentTransactionsQuery,
    recentActivityQuery,
  };
}
