import axios from 'axios';
import { getToken, clearSession } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      const onLogin = window.location.pathname.startsWith('/login');
      if (!onLogin) {
        clearSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
export function unwrap<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

export function unwrapMessage(
  res: { data: { message?: string } },
  fallback = 'Done',
): string {
  return res.data?.message ?? fallback;
}
export function apiError(error: any, fallback = 'Something went wrong'): string {
  const msg = error?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0];
  if (typeof msg === 'string') return msg;
  return fallback;
}

export default api;
