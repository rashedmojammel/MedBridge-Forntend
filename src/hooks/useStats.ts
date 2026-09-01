'use client';

import { useQuery } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type {
  AdminStats,
  ChwStats,
  DoctorStats,
  PatientStats,
  PharmacistStats,
} from '@/types';

/**
 * Dashboard counters come pre-aggregated from the backend. Pages must not
 * fetch full lists and count them in the browser - the lists are paged and
 * role-scoped, so the totals would be wrong as well as slow.
 */
export function useAdminStats(days?: number) {
  return useQuery({
    queryKey: ['stats', 'admin', days ?? 30],
    queryFn: async () =>
      unwrap<AdminStats>(await api.get('/stats/admin', { params: { days } })),
  });
}

export function useDoctorStats(days?: number) {
  return useQuery({
    queryKey: ['stats', 'doctor', days ?? 30],
    queryFn: async () =>
      unwrap<DoctorStats>(await api.get('/stats/doctor', { params: { days } })),
  });
}

export function useChwStats(days?: number) {
  return useQuery({
    queryKey: ['stats', 'chw', days ?? 30],
    queryFn: async () =>
      unwrap<ChwStats>(await api.get('/stats/chw', { params: { days } })),
  });
}

export function usePharmacistStats(days?: number) {
  return useQuery({
    queryKey: ['stats', 'pharmacist', days ?? 30],
    queryFn: async () =>
      unwrap<PharmacistStats>(await api.get('/stats/pharmacist', { params: { days } })),
  });
}

/** Returns null for a patient account with no patient record linked yet. */
export function usePatientStats() {
  return useQuery({
    queryKey: ['stats', 'patient'],
    queryFn: async () => unwrap<PatientStats | null>(await api.get('/stats/patient')),
  });
}
