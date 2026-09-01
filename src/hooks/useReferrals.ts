'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { Referral, ReferralStatus, ReferralUrgency } from '@/types';

export function useReferrals(status?: ReferralStatus) {
  return useQuery({
    queryKey: ['referrals', status ?? 'all'],
    queryFn: async () =>
      unwrap<Referral[]>(
        await api.get('/referrals', { params: { status: status || undefined } }),
      ),
  });
}

export function usePatientReferrals(patientId?: number | string) {
  return useQuery({
    queryKey: ['referrals', 'patient', patientId],
    queryFn: async () =>
      unwrap<Referral[]>(await api.get(`/referrals/patient/${patientId}`)),
    enabled: Boolean(patientId),
  });
}

export function useCreateReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      patientId: number;
      consultationId?: number;
      facilityName: string;
      facilityType?: string;
      department?: string;
      reason: string;
      clinicalSummary?: string;
      urgency: ReferralUrgency;
    }) => unwrap<Referral>(await api.post('/referrals', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useUpdateReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number;
      status?: ReferralStatus;
      outcome?: string;
    }) => unwrap<Referral>(await api.patch(`/referrals/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}
