// Regional settings hooks — user's language/country/format preferences.
// Endpoints: GET/PUT /profile/regional, GET /profile/regional/template.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../client';

export function useRegionalSettings() {
  return useQuery({
    queryKey: ['regionalSettings'],
    queryFn: async () => {
      const res = await client.get('/profile/regional');
      return res?.data ?? res;
    },
  });
}

export function useRegionalTemplate() {
  return useQuery({
    queryKey: ['regionalTemplate'],
    queryFn: async () => {
      const res = await client.get('/profile/regional/template');
      return res?.data ?? res;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useSaveRegionalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await client.put('/profile/regional', payload);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regionalSettings'] });
    },
  });
}
