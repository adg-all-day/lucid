// auth store — holds the bearer token with SecureStore persistence
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

const useAuthStore = create((set) => ({
  token: null,
  isAuthenticated: false,
  hydrating: true,
  sessionId: null,

  setToken: async (token) => {
    set({ token, isAuthenticated: !!token });
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  setSessionId: (sessionId) => set({ sessionId }),

  clearToken: async () => {
    set({ token: null, isAuthenticated: false, sessionId: null });
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        set({ token, isAuthenticated: true, hydrating: false });
      } else {
        set({ hydrating: false });
      }
    } catch {
      set({ hydrating: false });
    }
  },
}));

export default useAuthStore;
