'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { PublicSettings, SystemSetting, TriageThresholds } from '@/types';

export function usePublicSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: async () => unwrap<PublicSettings>(await api.get('/settings/public')),
    staleTime: 5 * 60_000,
  });
}

/**
 * Clinical parameters, not constants. Anything that colours a vital sign must
 * read them from here so an admin can retune triage without a redeploy.
 */
export function useTriageThresholds() {
  return useQuery({
    queryKey: ['settings', 'triage-thresholds'],
    queryFn: async () =>
      unwrap<TriageThresholds>(await api.get('/settings/triage-thresholds')),
    staleTime: 5 * 60_000,
  });
}

export function useSettings(category?: string) {
  return useQuery({
    queryKey: ['settings', category ?? 'all'],
    queryFn: async () =>
      unwrap<SystemSetting[]>(
        await api.get('/settings', { params: { category: category || undefined } }),
      ),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: { key: string; value: string }[]) =>
      unwrap<SystemSetting[]>(await api.put('/settings', { settings })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
