'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { usePatient } from '@/hooks/usePatients';
import { useRecordVitals, useSubmitSymptoms, useVitalTone } from '@/hooks/useTriage';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';
import { ageFrom, cn } from '@/lib/utils';

/**
 * English values with a translated label from `enums.symptom` - what the CHW
 * taps is what the doctor reads back, and doctors work in English.
 */
const SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Body ache', 'Vomiting', 'Fatigue',
  'Diarrhea', 'Rash', 'Sore throat', 'Breathing difficulty', 'Chest pain', 'Dizziness',
];

/** Labels come from the shared `vitals` namespace - the doctor reads them too. */
const VITAL_FIELDS = [
  { key: 'temperature', labelKey: 'temperature', unit: '°C', step: '0.1', tone: 'temperature' },
  { key: 'bpSystolic', labelKey: 'systolic', unit: 'mmHg', step: '1', tone: 'bpSystolic' },
  { key: 'bpDiastolic', labelKey: 'diastolic', unit: 'mmHg', step: '1', tone: null },
  { key: 'pulse', labelKey: 'pulse', unit: 'bpm', step: '1', tone: 'pulse' },
  { key: 'spo2', labelKey: 'spo2', unit: '%', step: '1', tone: 'spo2' },
  { key: 'respiratoryRate', labelKey: 'respiratoryRate', unit: '/min', step: '1', tone: null },
] as const;

const DURATIONS = ['SINCE_TODAY', '2_DAYS', '1_WEEK', '2_WEEKS_PLUS'] as const;

const SEVERITIES = ['MILD', 'MODERATE', 'SEVERE'] as const;

export default function TriagePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('chw.triage');
  const tc = useTranslations('common');
  const ts = useTranslations('enums.status');
  const td = useTranslations('enums.duration');
  const tsym = useTranslations('enums.symptom');
  const tg = useTranslations('enums.gender');
  const tv = useTranslations('vitals');
  const f = useFormat();

  const { data: patient, isLoading } = usePatient(patientId);
  const recordVitals = useRecordVitals();
  const submitSymptoms = useSubmitSymptoms();
  // an admin can retune these, so read them live rather than assuming defaults
  const { tone: toneOf, thresholds, suggest } = useVitalTone();

  const [step, setStep] = useState(1);
  const [vitals, setVitals] = useState<Record<string, string>>({});
  const [vitalSignId, setVitalSignId] = useState<number | undefined>();
  const [complaint, setComplaint] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE'>('MODERATE');
  const [duration, setDuration] = useState<string>('SINCE_TODAY');
  const [triage, setTriage] = useState<'CRITICAL' | 'NON_CRITICAL' | ''>('');
  const [notes, setNotes] = useState('');

  const num = (k: string) => (vitals[k] ? Number(vitals[k]) : 0);

  /** Same rules the backend applies - shown live so the CHW sees it before saving. */
  const suggestion = useMemo(
    () =>
      suggest({
        spo2: num('spo2'),
        bpSystolic: num('bpSystolic'),
        temperature: num('temperature'),
        pulse: num('pulse'),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vitals, thresholds],
  );

  /** Which readings are actually outside limits, so the alert can name them. */
  const flagged = useMemo(
    () =>
      (['temperature', 'bpSystolic', 'pulse', 'spo2'] as const)
        .filter((k) => num(k) && toneOf(k, num(k)) === 'critical')
        .map((k) => tv(VITAL_FIELDS.find((field) => field.key === k)!.labelKey)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vitals, thresholds, tv],
  );

  const vitalsReady =
    num('temperature') > 0 && num('bpSystolic') > 0 && num('bpDiastolic') > 0 &&
    num('pulse') > 0 && num('spo2') > 0;

  const saveVitals = () => {
    recordVitals.mutate(
      {
        patientId: Number(patientId),
        temperature: num('temperature'),
        bpSystolic: num('bpSystolic'),
        bpDiastolic: num('bpDiastolic'),
        pulse: num('pulse'),
        spo2: num('spo2'),
        respiratoryRate: vitals.respiratoryRate ? num('respiratoryRate') : undefined,
      },
      {
        onSuccess: (saved) => {
          setVitalSignId(saved.id);
          if (!triage && suggestion) setTriage(suggestion);
          setStep(2);
          toast(t('vitalsSaved'));
        },
        onError: (e) => toast(apiError(e, t('vitalsFailed')), 'error'),
      },
    );
  };

  const submit = () => {
    if (!complaint.trim()) return toast(t('complaintRequired'), 'error');
    if (!triage) return toast(t('classificationRequired'), 'error');

    submitSymptoms.mutate(
      {
        patientId: Number(patientId),
        vitalSignId,
        primaryComplaint: complaint,
        symptoms: selected,
        duration,
        severity,
        triageStatus: triage,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast(triage === 'CRITICAL' ? t('criticalSubmitted') : t('saved'));
          router.push('/chw/schedule');
        },
        onError: (e) => toast(apiError(e, t('submitFailed')), 'error'),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {tc('back')}
      </button>

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{patient?.fullName}</p>
            <p className="font-mono text-xs text-slate-500">{f.digits(patient?.mrn)}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>
              {tc('age')}: {f.num(ageFrom(patient?.dob))}
            </span>
            <span>
              {tc('gender')}:{' '}
              {patient?.gender && tg.has(patient.gender) ? tg(patient.gender) : patient?.gender}
            </span>
            <span>
              {t('blood')}: {patient?.bloodGroup ?? tc('dash')}
            </span>
          </div>
          {patient?.allergies && (
            <Badge tone="red">{t('allergy', { list: patient.allergies })}</Badge>
          )}
        </div>
      </Card>

      <div className="mb-5 flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {(['stepVitals', 'stepSymptoms'] as const).map((labelKey, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <button
              key={labelKey}
              onClick={() => n === 1 && setStep(1)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
                active ? 'bg-blue-600 text-white' : done ? 'bg-green-50 text-green-700' : 'text-slate-400',
              )}
            >
              {done && <Check className="h-3.5 w-3.5" aria-hidden />}
              {t('step', { n: f.num(n), label: t(labelKey) })}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-slate-900">{t('stepVitals')}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {VITAL_FIELDS.map((field) => {
                  const tone = field.tone ? toneOf(field.tone, num(field.key)) : 'normal';
                  const dot = {
                    normal: 'bg-green-500',
                    warning: 'bg-orange-500',
                    critical: 'bg-red-500',
                  }[tone];
                  return (
                    <div
                      key={field.key}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      {field.tone && (
                        <span
                          className={cn(
                            'h-2 w-2 shrink-0 rounded-full',
                            vitals[field.key] ? dot : 'bg-slate-300',
                          )}
                        />
                      )}
                      <label className="flex-1 text-sm text-slate-700">
                        {tv(field.labelKey)}
                      </label>
                      <input
                        type="number"
                        step={field.step}
                        value={vitals[field.key] ?? ''}
                        onChange={(e) =>
                          setVitals((v) => ({ ...v, [field.key]: e.target.value }))
                        }
                        className="h-8 w-20 rounded-md border border-slate-200 px-2 text-center text-sm font-semibold outline-none focus:border-blue-500"
                      />
                      <span className="w-12 text-xs text-slate-400">{field.unit}</span>
                    </div>
                  );
                })}
              </div>

              {suggestion && (
                <Alert
                  tone={suggestion === 'CRITICAL' ? 'danger' : 'info'}
                  className="mt-4 rounded-lg"
                  title={t('suggested', { status: ts(suggestion) })}
                >
                  {suggestion === 'CRITICAL'
                    ? t('outsideLimits', {
                        list: flagged.join(', ') || t('oneOrMore'),
                      })
                    : t('withinRanges')}{' '}
                  {!vitalsReady && t('partialSet')}
                  <span className="mt-1.5 block text-xs opacity-80">
                    {t('limitsInUse', {
                      temp: f.num(thresholds.temperatureCritical),
                      low: f.num(thresholds.systolicLow),
                      high: f.num(thresholds.systolicHigh),
                      pulse: f.num(thresholds.pulseCritical),
                      spo2: f.num(thresholds.spo2Critical),
                    })}
                  </span>
                </Alert>
              )}

              <div className="mt-5 flex justify-end">
                <Button onClick={saveVitals} loading={recordVitals.isPending} disabled={!vitalsReady}>
                  {t('saveContinue')} <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-slate-900">
                {t('classifyHeading')}
              </h2>

              <Textarea
                label={t('complaint')}
                required
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder={t('complaintPlaceholder')}
              />

              <p className="mb-2 mt-4 block text-xs font-medium text-slate-700">
                {tc('symptoms')}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SYMPTOMS.map((s) => {
                  const on = selected.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setSelected((prev) =>
                          on ? prev.filter((x) => x !== s) : [...prev, s],
                        )
                      }
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                        on
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300',
                      )}
                    >
                      {tsym.has(s) ? tsym(s) : s}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Select
                  label={t('duration')}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {td(d)}
                    </option>
                  ))}
                </Select>
                <Select
                  label={t('severity')}
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {ts(s)}
                    </option>
                  ))}
                </Select>
              </div>

              <p className="mb-2 mt-5 block text-xs font-medium text-slate-700">
                {t('classification')} <span className="text-red-600">*</span>
              </p>
              <div className="space-y-2">
                {[
                  { value: 'NON_CRITICAL', hintKey: 'nonCriticalHint', tone: 'green' },
                  { value: 'CRITICAL', hintKey: 'criticalHint', tone: 'red' },
                ].map((opt) => {
                  const on = triage === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTriage(opt.value as any)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors',
                        on && opt.tone === 'red' && 'border-red-500 bg-red-50',
                        on && opt.tone === 'green' && 'border-green-500 bg-green-50',
                        !on && 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                          on ? 'border-current' : 'border-slate-300',
                          on && opt.tone === 'red' && 'text-red-600',
                          on && opt.tone === 'green' && 'text-green-600',
                        )}
                      >
                        {on && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-slate-900">
                          {ts(opt.value)}
                        </span>
                        <span className="block text-xs text-slate-500">{t(opt.hintKey)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {triage === 'CRITICAL' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <Alert tone="danger" className="mt-3 rounded-lg" title={t('emergencyTitle')}>
                    {t('emergencyBody')}
                  </Alert>
                </motion.div>
              )}

              <div className="mt-4">
                <Textarea
                  label={t('additionalNotes')}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('notesPlaceholder')}
                />
              </div>

              <div className="mt-5 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden /> {tc('back')}
                </Button>
                <Button onClick={submit} loading={submitSymptoms.isPending}>
                  {t('submit')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
