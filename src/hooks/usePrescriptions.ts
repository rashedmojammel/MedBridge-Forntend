'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { Prescription, TreatmentPlan } from '@/types';

export interface PrescriptionItemPayload {
  medicineId: number;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
}

export function usePrescriptions() {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => unwrap<Prescription[]>(await api.get('/prescriptions')),
  });
}

export function usePrescription(id?: number | string) {
  return useQuery({
    queryKey: ['prescriptions', id],
    queryFn: async () => unwrap<Prescription>(await api.get(`/prescriptions/${id}`)),
    enabled: Boolean(id),
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      consultationId?: number;
      patientId: number;
      notes?: string;
      items: PrescriptionItemPayload[];
    }) => unwrap<Prescription>(await api.post('/prescriptions', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions'] }),
  });
}

/** Prescriptions are immutable - cancel is the only mutation path. */
export function useCancelPrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) =>
      unwrap<Prescription>(await api.patch(`/prescriptions/${id}/cancel`, { reason })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions'] }),
  });
}

export function useTreatmentPlans(patientId?: number | string) {
  return useQuery({
    queryKey: ['treatment-plans', patientId],
    queryFn: async () =>
      unwrap<TreatmentPlan[]>(await api.get(`/treatment-plans/patient/${patientId}`)),
    enabled: Boolean(patientId),
  });
}

export function useCreateTreatmentPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      patientId: number;
      title: string;
      details: string;
      startDate: string;
      endDate: string;
    }) => unwrap<TreatmentPlan>(await api.post('/treatment-plans', payload)),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['treatment-plans', vars.patientId] }),
  });
}
