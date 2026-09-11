'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { CreatePatientResult, Patient } from '@/types';

export function usePatients(search?: string) {
  return useQuery({
    queryKey: ['patients', search ?? ''],
    queryFn: async () =>
      unwrap<Patient[]>(await api.get('/patients', { params: { search: search || undefined } })),
  });
}

export function usePatient(id?: number | string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => unwrap<Patient>(await api.get(`/patients/${id}`)),
    enabled: Boolean(id),
  });
}

/**
 * The backend now creates a login account alongside the patient record, so
 * the response is `{ patient, credentials }` rather than a bare Patient -
 * see PatientsService.create(). `credentials` is only ever present in this
 * one response; there is nowhere else in the app it can be fetched from.
 */
export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) =>
      unwrap<CreatePatientResult>(await api.post('/patients', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
}

export function useUpdatePatient(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) =>
      unwrap<Patient>(await api.patch(`/patients/${id}`, payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      qc.invalidateQueries({ queryKey: ['patients', id] });
    },
  });
}

/**
 * No delete route by design - a patient record anchors triage history,
 * consultations, and prescriptions. Correct the record with `useUpdatePatient`.
 */