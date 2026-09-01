'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { FieldVisit, VisitOutcome, VisitStats } from '@/types';

export function useVisits(params?: { from?: string; to?: string; patientId?: number }) {
  return useQuery({
    queryKey: ['field-visits', params ?? {}],
    queryFn: async () =>
      unwrap<FieldVisit[]>(await api.get('/field-visits', { params })),
  });
}

/** Coverage summary for the signed-in CHW: outcomes, villages, travel time. */
export function useVisitStats(days?: number) {
  return useQuery({
    queryKey: ['field-visits', 'stats', days ?? 30],
    queryFn: async () =>
      unwrap<VisitStats>(await api.get('/field-visits/stats', { params: { days } })),
  });
}

export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      patientId: number;
      visitDate: string;
      outcome: VisitOutcome;
      notes?: string;
      village?: string;
      travelMinutes?: number;
      followUpNeeded?: boolean;
    }) => unwrap<FieldVisit>(await api.post('/field-visits', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['field-visits'] }),
  });
}

export function useDeleteVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => unwrap<any>(await api.delete(`/field-visits/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['field-visits'] }),
  });
}
