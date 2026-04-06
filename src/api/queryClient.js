// Shared QueryClient instance — used by both the provider in _layout.js
// and the 401 interceptor in client.js for cache clearing on logout.
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

export default queryClient;
