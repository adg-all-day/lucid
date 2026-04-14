import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import client from '../../../api/client';
import { extractCollection, extractPayload } from '../../../api/utils/responseParsers';
import { queryKeys } from '../../../constants/queryKeys';

export function formatDateParam(date) {
  if (!date) return undefined;

  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function useActivityLogQuery({ limit = 10, startDate = null, endDate = null } = {}) {
  const params = {
    limit,
    ...(startDate ? { start_date: formatDateParam(startDate) } : {}),
    ...(endDate ? { end_date: formatDateParam(endDate) } : {}),
  };

  return useQuery({
    queryKey: [...queryKeys.activityLog, params],
    queryFn: async () => {
      const res = await client.get('/security/activity', { params });
      return extractCollection(res);
    },
  });
}

function getCollectionTotal(payload) {
  return (
    payload?.total ??
    payload?.count ??
    payload?.total_records ??
    payload?.total_filtered_records ??
    payload?.data?.total ??
    payload?.data?.count ??
    payload?.data?.total_records ??
    payload?.data?.total_filtered_records ??
    null
  );
}

export function useInfiniteActivityLogQuery({
  limit = 20,
  startDate = null,
  endDate = null,
} = {}) {
  const baseParams = {
    limit,
    ...(startDate ? { start_date: formatDateParam(startDate) } : {}),
    ...(endDate ? { end_date: formatDateParam(endDate) } : {}),
  };

  return useInfiniteQuery({
    queryKey: [...queryKeys.activityLog, 'infinite', baseParams],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const raw = await client.get('/security/activity', {
        params: {
          ...baseParams,
          offset: pageParam,
        },
      });

      const payload = extractPayload(raw);
      const items = extractCollection(payload);

      return {
        items,
        offset: pageParam,
        limit,
        total: getCollectionTotal(payload),
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0);

      if (typeof lastPage.total === 'number' && loadedCount >= lastPage.total) {
        return undefined;
      }

      if (lastPage.items.length < limit) {
        return undefined;
      }

      return loadedCount;
    },
  });
}
