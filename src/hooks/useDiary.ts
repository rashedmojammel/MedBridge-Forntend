'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { DiaryEntry, DiaryMood, DiarySummary } from '@/types';

/** The signed-in patient's own entries. */
export function useMyDiary() {
  return useQuery({
    queryKey: ['diary', 'me'],
    queryFn: async () => unwrap<DiaryEntry[]>(await api.get('/diary/me')),
  });
}

export function usePatientDiary(patientId?: number | string) {
  return useQuery({
    queryKey: ['diary', 'patient', patientId],
    queryFn: async () =>
      unwrap<DiaryEntry[]>(await api.get(`/diary/patient/${patientId}`)),
    enabled: Boolean(patientId),
  });
}

export function useDiarySummary(patientId?: number | string, days?: number) {
  return useQuery({
    queryKey: ['diary', 'patient', patientId, 'summary', days ?? 30],
    queryFn: async () =>
      unwrap<DiarySummary>(
        await api.get(`/diary/patient/${patientId}/summary`, { params: { days } }),
      ),
    enabled: Boolean(patientId),
  });
}

/** A patient omits patientId - the backend resolves it from the token. */
export function useCreateDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      patientId?: number;
      note: string;
      symptoms?: string[];
      mood: DiaryMood;
      painLevel?: number;
      medicationTaken?: boolean;
    }) => unwrap<DiaryEntry>(await api.post('/diary', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary'] }),
  });
}

export function useDeleteDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => unwrap<any>(await api.delete(`/diary/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary'] }),
  });
}
