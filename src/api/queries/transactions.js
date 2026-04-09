// React Query hooks for the transactions & profile endpoints.
// These replace the raw fetch functions from constants/api.js and give us
// caching, refetching, and mutation invalidation basically for free.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client, { multipartClient } from '../client';
import { extractCollection, extractPayload } from '../utils/responseParsers';

// ── Transactions list ────────────────────────────────────────────────
// The API response shape (after axios unwraps one layer) is:
//   { data: [...transactions], total_filtered_records: N }
// so we dig into `.data` one more time to hand back just the array.
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await client.get('/transactions');
      return extractCollection(res);
    },
  });
}

// ── Single transaction ───────────────────────────────────────────────
// Pretty straightforward — grab one transaction by id.
// We only fire the query when we actually have an id to look up.
export function useTransaction(id) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const res = await client.get(`/transactions/${id}`);
      return extractPayload(res);
    },
    enabled: !!id,
  });
}

// ── Create transaction ───────────────────────────────────────────────
// This MUST use multipart/form-data — the backend returns 400 if you
// send JSON. We use the multipartClient which doesn't set Content-Type
// so axios can add the boundary automatically.
//
// I suggestion we add optimistic updates here eventually so the UI feels
// snappier while the upload is in progress.
// ── Transaction history ──────────────────────────────────────────────
export function useTransactionHistory(id) {
  return useQuery({
    queryKey: ['transactionHistory', id],
    queryFn: async () => {
      const res = await client.get(`/transactions/${id}/history`);
      return extractCollection(res);
    },
    enabled: !!id,
  });
}

// ── Settlement statement ─────────────────────────────────────────────
export function useSettlementStatement(id) {
  return useQuery({
    queryKey: ['settlementStatement', id],
    queryFn: async () => {
      const res = await client.get(`/transactions/${id}/settlement`);
      return extractPayload(res);
    },
    enabled: !!id,
  });
}

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
      try {
        const res = await multipartClient.post('/transactions', formData, {
          params: { draft },
        });
        return res;
      } catch (error) {
        // The backend sometimes returns non-JSON error bodies (plain text,
        // HTML, etc.), so we try to pull something useful out of whatever
        // we got back.
        const raw = error.response?.data;
        if (typeof raw === 'string') {
          try {
            return JSON.parse(raw);
          } catch {
            // couldn't parse it, just wrap the text so callers can display it
            return { error: raw, statusCode: error.response?.status };
          }
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Refetch the transactions list so the new one shows up right away
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
