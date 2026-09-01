'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { PublicChw, PublicDoctor, PublicStaff, User } from '@/types';

export function usePublicDoctors(search?: string, specialization?: string) {
  return useQuery({
    queryKey: ['public', 'doctors', search ?? '', specialization ?? ''],
    queryFn: async () =>
      unwrap<PublicDoctor[]>(
        await api.get('/users/public/doctors', {
          params: { search: search || undefined, specialization: specialization || undefined },
        }),
      ),
  });
}

export function usePublicDoctor(id?: number | string) {
  return useQuery({
    queryKey: ['public', 'doctors', id],
    queryFn: async () =>
      unwrap<PublicDoctor>(await api.get(`/users/public/doctors/${id}`)),
    enabled: Boolean(id),
  });
}

export function usePublicChws(search?: string) {
  return useQuery({
    queryKey: ['public', 'chws', search ?? ''],
    queryFn: async () =>
      unwrap<PublicChw[]>(
        await api.get('/users/public/chws', { params: { search: search || undefined } }),
      ),
  });
}

export function usePublicStaff(department?: string) {
  return useQuery({
    queryKey: ['public', 'staff', department ?? ''],
    queryFn: async () =>
      unwrap<PublicStaff[]>(
        await api.get('/users/public/staff', {
          params: { department: department || undefined },
        }),
      ),
  });
}

export function useUsers(params?: { role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['users', params ?? {}],
    queryFn: async () => unwrap<User[]>(await api.get('/users', { params })),
  });
}

export function useUser(id?: number | string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => unwrap<any>(await api.get(`/users/${id}`)),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) =>
      unwrap<User>(await api.post('/users', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      unwrap<User>(await api.patch(`/users/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

/**
 * There is no DELETE /users/:id and there should not be - clinical records
 * reference their author forever. Deactivating revokes login while keeping the
 * audit trail and every consultation, prescription, and triage row intact.
 */
export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) =>
      unwrap<User>(await api.patch(`/users/${id}`, { isActive })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return unwrap<User>(
        await api.post(`/users/${id}/photo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
