// Auth mutation hooks — login, register, 2FA, password reset, etc.
import { useMutation } from '@tanstack/react-query';
import client from '../client';
import useAuthStore from '../../stores/authStore';
import useUserStore from '../../stores/userStore';

function getAuthPayload(data) {
  return data?.data ?? data;
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await client.post('/auth/login', { email, password });
      return res?.data ?? res;
    },
    onSuccess: (data) => {
      const payload = getAuthPayload(data);

      // if 2FA is required, don't set token yet — the screen handles navigation
      if (payload?.requires_2fa) return;

      if (payload?.token) {
        useAuthStore.getState().setToken(payload.token);
      }
      if (payload?.user) {
        useUserStore.getState().setUser(payload.user);
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ first_name, last_name, email, password, repeat_password }) => {
      const res = await client.post('/auth/register', {
        first_name,
        last_name,
        email,
        password,
        repeat_password,
      });
      return res?.data ?? res;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }) => {
      const res = await client.post('/auth/forgot-password', { email });
      return res?.data ?? res;
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async ({ email }) => {
      const res = await client.post('/auth/resend-verification', { email });
      return res?.data ?? res;
    },
  });
}

export function useVerifyResetToken() {
  return useMutation({
    mutationFn: async ({ token }) => {
      const res = await client.get('/auth/verify-reset', { params: { token } });
      return res?.data ?? res;
    },
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: async ({ token, password, repeat_password }) => {
      const res = await client.post('/auth/set-password', { token, password, repeat_password });
      return res?.data ?? res;
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async ({ token }) => {
      const res = await client.post('/auth/verify-email', { token });
      return res?.data ?? res;
    },
  });
}

export function useGet2FAMethods() {
  return useMutation({
    mutationFn: async ({ session_id }) => {
      const res = await client.post('/auth/2fa/methods', { session_id });
      return res?.data ?? res;
    },
  });
}

export function useSend2FAChallenge() {
  return useMutation({
    mutationFn: async ({ session_id, method }) => {
      const res = await client.post('/auth/2fa/challenge', { session_id, method });
      return res?.data ?? res;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const res = await client.post('/security/logout');
      return res?.data ?? res;
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ current_password, new_password, repeat_password }) => {
      const res = await client.post('/security/password', {
        current_password,
        new_password,
        repeat_password,
      });
      return res?.data ?? res;
    },
  });
}

export function useVerify2FA() {
  return useMutation({
    mutationFn: async ({ session_id, code }) => {
      const res = await client.post('/auth/2fa/verify', { session_id, code });
      return res?.data ?? res;
    },
    onSuccess: (data) => {
      const payload = getAuthPayload(data);

      if (payload?.token) {
        useAuthStore.getState().setToken(payload.token);
      }
      if (payload?.user) {
        useUserStore.getState().setUser(payload.user);
      }
    },
  });
}
