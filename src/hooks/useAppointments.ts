'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { Appointment } from '@/types';

export function useAppointments(filter?: 'upcoming' | 'past') {
  return useQuery({
    queryKey: ['appointments', filter ?? 'all'],
    queryFn: async () =>
      unwrap<Appointment[]>(
        await api.get('/appointments', { params: { filter: filter || undefined } }),
      ),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      patientId: number;
      doctorId: number;
      scheduledAt: string;
      type?: string;
    }) => unwrap<Appointment>(await api.post('/appointments', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      unwrap<Appointment>(await api.patch(`/appointments/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}


export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, cancelReason }: { id: number; cancelReason: string }) =>
      unwrap<Appointment>(
        await api.patch(`/appointments/${id}`, { status: 'CANCELLED', cancelReason }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
