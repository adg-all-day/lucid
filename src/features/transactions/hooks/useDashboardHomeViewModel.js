import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../../../api/client';
import { extractCollection, extractPayload } from '../../../api/utils/responseParsers';
import { queryKeys } from '../../../constants/queryKeys';
import useActivityLogQuery from './useActivityLogQuery';
import useUserStore from '../../../stores/userStore';

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
  const queryClient = useQueryClient();
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

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

  const isRefreshing =
    isRefreshingAll ||
    countsQuery.isRefetching ||
    recentTransactionsQuery.isRefetching ||
    recentActivityQuery.isRefetching;

  const refetchAll = async () => {
    setIsRefreshingAll(true);
    try {
      const profileRes = await client.get('/profile').catch(() => null);
      const profile = profileRes ? extractPayload(profileRes) : null;
      if (profile) {
        queryClient.setQueryData(['profile'], profile);
        useUserStore.getState().setUser(profile);
      }
      await queryClient.refetchQueries({ type: 'active' });
    } finally {
      setIsRefreshingAll(false);
    }
  };

  return {
    isLoading,
    isRefreshing,
    refetchAll,
    stats,
    recentTransactions: recentTransactionsQuery.data ?? [],
    recentActivity: recentActivityQuery.data ?? [],
    recentTransactionsQuery,
    recentActivityQuery,
  };
}
