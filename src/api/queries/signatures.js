// Signature management hooks — upload, list, set default, and sign transactions.
// BASE_URL already contains the /api/v1 prefix, so paths are relative to that.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../client';

export function useSignatures() {
  return useQuery({
    queryKey: ['signatures'],
    queryFn: async () => {
      const res = await client.get('/signatures');
      return res?.data ?? res;
    },
  });
}

export function useDefaultSignature() {
  return useQuery({
    queryKey: ['signatures', 'default'],
    queryFn: async () => {
      const res = await client.get('/signatures/default');
      return res?.data ?? res;
    },
  });
}

export function useUploadSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await client.post('/signatures', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
    },
  });
}

export function useDeleteSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await client.delete(`/signatures/${id}`);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
    },
  });
}

export function useSignTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, signature_id, stamp_id }) => {
      const res = await client.post(`/transactions/${transactionId}/sign`, {
        signature_id,
        stamp_id,
      });
      return res?.data ?? res;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', String(variables.transactionId)] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory', String(variables.transactionId)] });
    },
  });
}
