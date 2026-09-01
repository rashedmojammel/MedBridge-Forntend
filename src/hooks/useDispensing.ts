'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { DispenseHistory, Prescription } from '@/types';

/** Active prescriptions still owing medicine - PENDING or PARTIAL. */
export function useDispensingQueue() {
  return useQuery({
    queryKey: ['dispensing', 'queue'],
    queryFn: async () => unwrap<Prescription[]>(await api.get('/dispensing/queue')),
  });
}

export function useDispenseHistory(prescriptionId?: number | string) {
  return useQuery({
    queryKey: ['dispensing', prescriptionId],
    queryFn: async () =>
      unwrap<DispenseHistory>(await api.get(`/prescriptions/${prescriptionId}/dispense`)),
    enabled: Boolean(prescriptionId),
  });
}

/**
 * Hands over medicine and decrements stock in one backend transaction, so a
 * success here means inventory has already moved - refresh medicines too.
 */
export function useDispense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      items,
      notes,
    }: {
      id: number;
      items: { medicineId: number; quantity: number }[];
      notes?: string;
    }) => unwrap<DispenseHistory>(await api.post(`/prescriptions/${id}/dispense`, { items, notes })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispensing'] });
      qc.invalidateQueries({ queryKey: ['prescriptions'] });
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
