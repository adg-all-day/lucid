// auth store — holds the bearer token with SecureStore persistence
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const LAST_LOGIN_IDENTIFIER_KEY = 'last_login_identifier';

const useAuthStore = create((set) => ({
  token: null,
  isAuthenticated: false,
  hydrating: true,
  sessionId: null,
  lastLoginIdentifier: '',

  setToken: async (token) => {
    set({ token, isAuthenticated: !!token });
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  setSessionId: (sessionId) => set({ sessionId }),

  setLastLoginIdentifier: async (identifier) => {
    const value = String(identifier || '').trim();
    set({ lastLoginIdentifier: value });

    if (value) {
      await SecureStore.setItemAsync(LAST_LOGIN_IDENTIFIER_KEY, value);
    } else {
      await SecureStore.deleteItemAsync(LAST_LOGIN_IDENTIFIER_KEY);
    }
  },

  clearToken: async () => {
    set({ token: null, isAuthenticated: false, sessionId: null });
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  hydrate: async () => {
    try {
      const [token, lastLoginIdentifier] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(LAST_LOGIN_IDENTIFIER_KEY),
      ]);

      if (token) {
        set({
          token,
          isAuthenticated: true,
          hydrating: false,
          lastLoginIdentifier: lastLoginIdentifier || '',
        });
      } else {
        set({ hydrating: false, lastLoginIdentifier: lastLoginIdentifier || '' });
      }
    } catch {
      set({ hydrating: false });
    }
  },
}));

export default useAuthStore;
