'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api, { unwrap, unwrapMessage } from '@/lib/api';
import { saveToken, saveUser, getUser, clearSession, dashboardFor } from '@/lib/auth';
import type { LoginResponse, User } from '@/types';

export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return user;
}

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (creds: { email: string; password: string }) =>
      unwrap<LoginResponse>(await api.post('/auth/login', creds)),
    onSuccess: (data) => {
      saveToken(data.access_token);
      saveUser(data.user);
      router.push(dashboardFor(data.user.role));
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) =>
      unwrap<LoginResponse>(await api.post('/auth/register', payload)),
    onSuccess: (data) => {
      saveToken(data.access_token);
      saveUser(data.user);
      router.push('/patient/dashboard');
      router.refresh();
    },
  });
}

export function useLogout() {
  const router = useRouter();
  return () => {
    clearSession();
    router.push('/login');
    router.refresh();
  };
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) =>
      unwrapMessage(await api.patch('/auth/change-password', payload), 'Password updated'),
  });
}

/**
 * Always resolves, even for an unknown address - the response must not reveal
 * whether an account exists. The backend logs the reset link server-side, so
 * in development you read the token out of the API console.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: { email: string }) =>
      unwrapMessage(
        await api.post('/auth/forgot-password', payload),
        'If that email is registered, a reset link has been sent.',
      ),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: { token: string; newPassword: string }) =>
      unwrapMessage(await api.post('/auth/reset-password', payload), 'Password reset'),
  });
}
