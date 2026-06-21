import axios from 'axios';
import { firebaseAuth } from '../auth/firebase';
import { API_BASE_URL } from '../config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use(async (config) => {
  const demoUserRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('interlance_demo_user') : null;
  if (demoUserRaw) {
    const demoUser = JSON.parse(demoUserRaw);
    config.headers['X-Demo-User-Email'] = demoUser.email;
    return config;
  }

  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown, fallback = 'Request failed') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  return fallback;
}
