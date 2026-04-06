// Signature management hooks — upload, list, set default, and sign transactions.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client, { multipartClient } from '../client';

export function useSignatures() {
  return useQuery({
    queryKey: ['signatures'],
    queryFn: async () => {
      const res = await client.get('/api/v1/signatures');
      return res?.data ?? res;
    },
  });
}

export function useDefaultSignature() {
  return useQuery({
    queryKey: ['signatures', 'default'],
    queryFn: async () => {
      const res = await client.get('/api/v1/signatures/default');
      return res?.data ?? res;
    },
  });
}

export function useUploadSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await multipartClient.post('/api/v1/signatures', formData);
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
      const res = await client.post(`/api/v1/transactions/${transactionId}/sign`, {
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
