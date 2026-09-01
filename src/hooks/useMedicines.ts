'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { Medicine, MedicineInventory, StockAction } from '@/types';

export function useMedicineSearch(q: string) {
  return useQuery({
    queryKey: ['medicines', 'search', q],
    queryFn: async () =>
      unwrap<Medicine[]>(await api.get('/medicines/search', { params: { q } })),
    enabled: q.trim().length > 1,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['medicines', 'low-stock'],
    queryFn: async () =>
      unwrap<MedicineInventory[]>(await api.get('/medicines/low-stock')),
  });
}

export function useAlternatives(medicineId?: number) {
  return useQuery({
    queryKey: ['medicines', medicineId, 'alternatives'],
    queryFn: async () =>
      unwrap<Medicine[]>(await api.get(`/medicines/${medicineId}/alternatives`)),
    enabled: Boolean(medicineId),
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) =>
      unwrap<Medicine>(await api.post('/medicines', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines'] }),
  });
}

export function useUpdateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      unwrap<Medicine>(await api.patch(`/medicines/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines'] }),
  });
}

/** Crossing below threshold fires LOW_STOCK notifications backend-side. */
export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      quantity,
      reason,
    }: {
      id: number;
      action: StockAction;
      quantity: number;
      reason: string;
    }) =>
      unwrap<MedicineInventory>(
        await api.patch(`/medicines/${id}/stock`, { action, quantity, reason }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * The catalogue has no delete route - medicines are referenced by issued
 * prescriptions. Retire one with `useUpdateMedicine({ isAvailable: false })`.
 */
