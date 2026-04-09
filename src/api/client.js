// Centralized axios client for all API calls.
// This replaces the raw fetch helpers in constants/api.js so we get
// consistent headers, interceptors, and error handling in one place.

import axios from 'axios';
import { router } from 'expo-router';
import { BASE_URL } from '@env';
import useAuthStore from '../stores/authStore';
import queryClient from './queryClient';

// Main JSON client — used for most GET/PUT/DELETE requests
const client = axios.create({
  baseURL: BASE_URL,
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

// Unwrap the axios response envelope so callers get the actual payload
// instead of having to do `.data` everywhere. Keeps hook code cleaner.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const path = error.config?.url;

    if (status === 401 && !path?.includes('/auth/')) {
      useAuthStore.getState().clearToken();
      queryClient.clear();
      router.replace('/log-in');
    }

    throw error;
  },
);

export default client;
