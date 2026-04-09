import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../client';
import { queryKeys } from '../../constants/queryKeys';
import { extractPayload } from '../utils/responseParsers';

// ── Resend counterparty email ("Nudge") ─────────────────────────────
export function useResendCounterpartyEmail() {
  return useMutation({
    mutationFn: async ({ transactionId, counterpartyId }) => {
      const res = await client.post(
        `/transactions/${transactionId}/counterparties/${counterpartyId}/resend-email`,
      );
      return extractPayload(res) ?? res;
    },
  });
}

// ── Create transaction ───────────────────────────────────────────────
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, draft = false }) => {
      const res = await client.post('/transactions', formData, {
        params: { draft },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return extractPayload(res) ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });
}
