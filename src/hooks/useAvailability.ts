'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { DaySlots, DoctorAvailability } from '@/types';

export interface SlotPayload {
  /** 0 = Sunday. */
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes?: number;
  isActive?: boolean;
}

export function useMyAvailability() {
  return useQuery({
    queryKey: ['availability', 'me'],
    queryFn: async () => unwrap<DoctorAvailability>(await api.get('/availability/me')),
  });
}

/** PUT replaces the entire weekly pattern - always send every slot you want kept. */
export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slots: SlotPayload[]) =>
      unwrap<DoctorAvailability>(await api.put('/availability/me', { slots })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability'] }),
  });
}

export function useAddTimeOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { date: string; reason?: string }) =>
      unwrap<any>(await api.post('/availability/me/time-off', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability'] }),
  });
}

export function useRemoveTimeOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      unwrap<any>(await api.delete(`/availability/me/time-off/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability'] }),
  });
}

export function useDoctorAvailability(doctorId?: number | string) {
  return useQuery({
    queryKey: ['availability', 'doctor', doctorId],
    queryFn: async () =>
      unwrap<DoctorAvailability>(await api.get(`/availability/doctor/${doctorId}`)),
    enabled: Boolean(doctorId),
  });
}

/** Free times for one doctor on one YYYY-MM-DD, booked slots already removed. */
export function useDoctorSlots(doctorId?: number | string, date?: string) {
  return useQuery({
    queryKey: ['availability', 'doctor', doctorId, 'slots', date],
    queryFn: async () =>
      unwrap<DaySlots>(
        await api.get(`/availability/doctor/${doctorId}/slots`, { params: { date } }),
      ),
    enabled: Boolean(doctorId && date),
  });
}
