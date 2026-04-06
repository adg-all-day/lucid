// Activity log query hook.
import { useQuery } from '@tanstack/react-query';
import client from '../client';
import { extractCollection } from '../utils/responseParsers';

export function useActivityLog() {
  return useQuery({
    queryKey: ['activityLog'],
    queryFn: async () => {
      const res = await client.get('/security/activity', { params: { limit: 10 } });
      return extractCollection(res);
    },
  });
}
