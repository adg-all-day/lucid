// Centralized axios client for all API calls.
// This replaces the raw fetch helpers in constants/api.js so we get
// consistent headers, interceptors, and error handling in one place.

import axios from 'axios';
import { BASE_URL } from '@env';
import useAuthStore from '../stores/authStore';
import useUserStore from '../stores/userStore';
import queryClient from './queryClient';

// Main JSON client — used for most GET/PUT/DELETE requests
const client = axios.create({
  baseURL: BASE_URL,
});

// Multipart client for file uploads. Same auth/response handling as `client`
// but axios will set Content-Type (including the boundary) automatically
// based on the FormData payload.
export const multipartClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  transformRequest: (data) => data,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

multipartClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Unwrap the axios response envelope so callers get the actual payload
// instead of having to do `.data` everywhere. Keeps hook code cleaner.
function unwrapAndHandleSession(response) {
  return response.data;
}

function handleSessionError(error) {
  const status = error.response?.status;
  const path = error.config?.url;

  const shouldClearSession =
    status === 401 &&
    !path?.includes('/auth/') &&
    !path?.includes('/security/password');

  if (shouldClearSession) {
    useAuthStore.getState().clearToken();
    useUserStore.getState().clearUser();
    queryClient.clear();
  }

  throw error;
}

client.interceptors.response.use(unwrapAndHandleSession, handleSessionError);
multipartClient.interceptors.response.use(unwrapAndHandleSession, handleSessionError);

export default client;
