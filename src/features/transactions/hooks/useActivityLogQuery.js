import { useQuery } from '@tanstack/react-query';
import client from '../../../api/client';
import { extractCollection } from '../../../api/utils/responseParsers';
import { queryKeys } from '../../../constants/queryKeys';

function formatDateParam(date) {
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
