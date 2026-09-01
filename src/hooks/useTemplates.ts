'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { AppliedTemplate, PrescriptionTemplate } from '@/types';

export function useTemplates() {
  return useQuery({
    queryKey: ['prescription-templates'],
    queryFn: async () =>
      unwrap<PrescriptionTemplate[]>(await api.get('/prescription-templates')),
  });
}

export function useTemplate(id?: number | string) {
  return useQuery({
    queryKey: ['prescription-templates', id],
    queryFn: async () =>
      unwrap<PrescriptionTemplate>(await api.get(`/prescription-templates/${id}`)),
    enabled: Boolean(id),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      condition?: string;
      notes?: string;
      isShared?: boolean;
      items: {
        medicineId: number;
        dosage: string;
        frequency: string;
        duration: string;
        route?: string;
        instructions?: string;
      }[];
    }) => unwrap<PrescriptionTemplate>(await api.post('/prescription-templates', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescription-templates'] }),
  });
}

/** Returns items ready to drop into the prescription form; bumps useCount. */
export function useApplyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      unwrap<AppliedTemplate>(await api.post(`/prescription-templates/${id}/apply`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescription-templates'] }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      unwrap<any>(await api.delete(`/prescription-templates/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescription-templates'] }),
  });
}
