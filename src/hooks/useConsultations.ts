'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { Consultation } from '@/types';

export function useConsultations(status?: string) {
  return useQuery({
    queryKey: ['consultations', status ?? 'all'],
    queryFn: async () =>
      unwrap<Consultation[]>(
        await api.get('/consultations', { params: { status: status || undefined } }),
      ),
  });
}

export function useConsultation(id?: number | string) {
  return useQuery({
    queryKey: ['consultations', id],
    queryFn: async () => unwrap<Consultation>(await api.get(`/consultations/${id}`)),
    enabled: Boolean(id),
  });
}

export function useCreateConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      patientId: number;
      doctorId: number;
      scheduledAt: string;
      reason: string;
    }) => unwrap<Consultation>(await api.post('/consultations', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consultations'] }),
  });
}

export function useSaveDiagnosis(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { diagnosis: string; notes?: string }) =>
      unwrap<Consultation>(await api.patch(`/consultations/${id}/diagnosis`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consultations', id] }),
  });
}

export function useCompleteConsultation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      unwrap<Consultation>(await api.patch(`/consultations/${id}/complete`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultations'] });
      qc.invalidateQueries({ queryKey: ['consultations', id] });
    },
  });
}
