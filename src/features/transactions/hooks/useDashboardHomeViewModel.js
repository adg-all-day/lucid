import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../../api/client';
import { extractCollection, extractPayload } from '../../../api/utils/responseParsers';
import { queryKeys } from '../../../constants/queryKeys';
import useActivityLogQuery from './useActivityLogQuery';

function readDashboardCounts(response) {
  const payload = extractPayload(response);
  const counts = payload?.data ?? payload ?? {};

  return {
    all: counts.total ?? 0,
    actionRequired: counts.action_required ?? 0,
    open: counts.open ?? 0,
    closed: counts.closed ?? 0,
  };
}

export default function useDashboardHomeViewModel() {
  const countsQuery = useQuery({
    queryKey: queryKeys.transactions({ scope: 'dashboard-counts' }),
    queryFn: async () => {
      const res = await client.get('/transactions/counts');
      return readDashboardCounts(res);
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
    () => countsQuery.data ?? { all: 0, actionRequired: 0, open: 0, closed: 0 },
    [countsQuery.data],
  );

  const isLoading =
    countsQuery.isLoading ||
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
