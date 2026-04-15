// Stamp management hooks — list and upload. Mirrors the signatures API shape.
// BASE_URL already contains the /api/v1 prefix, so paths are relative to that.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../client';

export function useStamps() {
  return useQuery({
    queryKey: ['stamps'],
    queryFn: async () => {
      const res = await client.get('/stamps');
      return res?.data ?? res;
    },
  });
}

export function useUploadStamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await client.post('/stamps', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
    },
  });
}

export function useDeleteStamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await client.delete(`/stamps/${id}`);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
    },
  });
}
