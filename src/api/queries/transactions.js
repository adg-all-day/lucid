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
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const res = await client.delete(`/transactions/${transactionId}`);
      return extractPayload(res) ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot });
    },
  });
}

export function useVoidTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const res = await client.patch(`/transactions/${transactionId}/void`);
      return extractPayload(res) ?? res;
    },
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot });
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(transactionId) });
    },
  });
}

export function useCompleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const res = await client.patch(`/transactions/${transactionId}/complete`);
      return extractPayload(res) ?? res;
    },
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot });
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(transactionId) });
    },
  });
}

export function useCopyTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const res = await client.post(`/transactions/${transactionId}/copy`);
      return extractPayload(res) ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot });
    },
  });
}

export function useSubmitTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const res = await client.put(`/transactions/${transactionId}/submit`);
      return extractPayload(res) ?? res;
    },
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot });
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(transactionId) });
    },
  });
}

export function useUpdateSettlementDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, status, comment }) => {
      const res = await client.put(`/transactions/${transactionId}/settlement`, {
        status,
        comment,
      });
      return extractPayload(res) ?? res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(variables.transactionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlementStatement(variables.transactionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot });
    },
  });
}
