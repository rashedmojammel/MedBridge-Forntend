'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import { useTriageThresholds } from '@/hooks/useSettings';
import type { SymptomReport, TriageThresholds, VitalSigns } from '@/types';

export interface VitalsPayload {
  patientId: number;
  temperature: number;
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
  spo2: number;
  respiratoryRate?: number;
  bloodSugar?: number;
}

export interface SymptomPayload {
  patientId: number;
  vitalSignId?: number;
  primaryComplaint: string;
  symptoms: string[];
  duration?: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  triageStatus: 'CRITICAL' | 'NON_CRITICAL';
  notes?: string;
}

/** Response carries the saved row plus computed warnings + suggestedTriage. */
export function useRecordVitals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: VitalsPayload) =>
      unwrap<VitalSigns>(await api.post('/triage/vitals', payload)),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['triage', vars.patientId] }),
  });
}

export function useSubmitSymptoms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SymptomPayload) =>
      unwrap<SymptomReport>(await api.post('/triage/symptoms', payload)),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['triage', vars.patientId] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useTriageHistory(patientId?: number | string) {
  return useQuery({
    queryKey: ['triage', patientId],
    queryFn: async () =>
      unwrap<{ vitals: VitalSigns[]; reports: SymptomReport[] }>(
        await api.get(`/triage/patient/${patientId}`),
      ),
    enabled: Boolean(patientId),
  });
}

/** Mirrors the backend defaults - only used until the live thresholds load. */
export const FALLBACK_THRESHOLDS: TriageThresholds = {
  spo2Critical: 92,
  spo2Warning: 95,
  systolicHigh: 140,
  systolicLow: 90,
  temperatureCritical: 39.5,
  temperatureWarning: 37.5,
  pulseCritical: 120,
  pulseWarning: 100,
};

export type VitalField = 'temperature' | 'spo2' | 'bpSystolic' | 'pulse';

/**
 * Colours a vital using the same numbers the backend triages on. The
 * thresholds are clinical settings an admin can retune, so they are read from
 * /settings/triage-thresholds rather than hardcoded here.
 */
export function vitalTone(
  field: VitalField,
  value: number,
  t: TriageThresholds = FALLBACK_THRESHOLDS,
): 'normal' | 'warning' | 'critical' {
  if (!value) return 'normal';
  switch (field) {
    case 'temperature':
      return value > t.temperatureCritical
        ? 'critical'
        : value > t.temperatureWarning
          ? 'warning'
          : 'normal';
    case 'spo2':
      return value < t.spo2Critical
        ? 'critical'
        : value < t.spo2Warning
          ? 'warning'
          : 'normal';
    case 'bpSystolic':
      // the backend has no warning band for blood pressure - it triages on
      // exactly this comparison, so a middle colour here would contradict the
      // suggestion shown beside it
      return value > t.systolicHigh || value < t.systolicLow ? 'critical' : 'normal';
    case 'pulse':
      return value > t.pulseCritical
        ? 'critical'
        : value > t.pulseWarning
          ? 'warning'
          : 'normal';
    default:
      return 'normal';
  }
}

/**
 * Mirrors the backend's own rule so a CHW is never told one thing on screen and
 * has the record graded another way on save. The comparisons are deliberately
 * identical to `TriageService.suggestTriage` - strictly greater, strictly less.
 *
 * Readings not yet entered are skipped, so this can be shown while the form is
 * still being filled in; it firms up as the remaining vitals arrive.
 */
export function suggestTriage(
  v: Partial<Record<VitalField, number>>,
  t: TriageThresholds = FALLBACK_THRESHOLDS,
): 'CRITICAL' | 'NON_CRITICAL' | null {
  const { spo2, bpSystolic: sys, temperature: temp, pulse } = v;
  if (!spo2 && !sys && !temp && !pulse) return null;
  if (spo2 && spo2 < t.spo2Critical) return 'CRITICAL';
  if (sys && (sys > t.systolicHigh || sys < t.systolicLow)) return 'CRITICAL';
  if (temp && temp > t.temperatureCritical) return 'CRITICAL';
  if (pulse && pulse > t.pulseCritical) return 'CRITICAL';
  return 'NON_CRITICAL';
}

/** Binds both helpers to the live thresholds so callers pass only field+value. */
export function useVitalTone() {
  const { data } = useTriageThresholds();
  const thresholds = data ?? FALLBACK_THRESHOLDS;
  return {
    thresholds,
    tone: (field: VitalField, value: number) => vitalTone(field, value, thresholds),
    suggest: (v: Partial<Record<VitalField, number>>) => suggestTriage(v, thresholds),
  };
}
