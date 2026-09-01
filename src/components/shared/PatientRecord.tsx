'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  Footprints,
  HeartPulse,
  NotebookPen,
  Phone,
  Send,
  Stethoscope,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import VitalChip from '@/components/shared/VitalChip';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Tabs from '@/components/ui/Tabs';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { usePatient, useUpdatePatient } from '@/hooks/usePatients';
import { useTriageHistory, useVitalTone } from '@/hooks/useTriage';
import { useDiarySummary, usePatientDiary } from '@/hooks/useDiary';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { useCreateTreatmentPlan, useTreatmentPlans } from '@/hooks/usePrescriptions';
import { useVisits } from '@/hooks/useVisits';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';
import { ageFrom } from '@/lib/utils';
import type { DiaryMood, Patient, ReferralUrgency } from '@/types';

const URGENCY_TONE: Record<ReferralUrgency, 'gray' | 'orange' | 'red'> = {
  ROUTINE: 'gray',
  URGENT: 'orange',
  EMERGENCY: 'red',
};

const MOOD_TONE: Record<DiaryMood, 'green' | 'yellow' | 'red'> = {
  BETTER: 'green',
  SAME: 'yellow',
  WORSE: 'red',
};

/**
 * The whole record for one patient, shared by the CHW and doctor routes.
 *
 * Tab panels are separate components so their queries only fire when the tab is
 * opened - several of these endpoints are role-scoped, and a doctor asking for
 * field visits (or a CHW asking for treatment plans) would just collect a 403.
 */
export default function PatientRecord({
  patientId,
  role,
  backHref,
}: {
  patientId: string;
  role: 'CHW' | 'DOCTOR';
  backHref: string;
}) {
  const { data: patient, isLoading } = usePatient(patientId);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const t = useTranslations('record');
  const tc = useTranslations('common');
  const tg = useTranslations('enums.gender');

  const rolePath = role.toLowerCase();

  if (isLoading) {
    return <ListSkeleton rows={6} />;
  }

  if (!patient) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardList}
          title={t('notFoundTitle')}
          description={t('notFoundBody')}
          action={
            <Link href={backHref}>
              <Button size="sm" variant="outline">
                {t('backToPatients')}
              </Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const tabs = [
    { key: 'overview', label: t('tabOverview') },
    { key: 'triage', label: t('tabTriage') },
    { key: 'diary', label: t('tabDiary') },
    { key: 'referrals', label: t('tabReferrals') },
    role === 'DOCTOR'
      ? { key: 'plans', label: t('tabPlans') }
      : { key: 'visits', label: t('tabVisits') },
  ];

  const age = ageFrom(patient.dob);

  return (
    <>
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('backToPatients')}
      </Link>

      <PageHeader
        title={patient.fullName}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {patient.mrn}
            </code>
            <span>
              {age != null ? tc('years', { count: age }) : tc('dash')} ·{' '}
              {patient.gender && tg.has(patient.gender)
                ? tg(patient.gender)
                : patient.gender}
            </span>
            {patient.bloodGroup && (
              <span>
                {tc('bloodGroup')} {patient.bloodGroup}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" aria-hidden />
              {patient.phone}
            </span>
          </span>
        }
        action={
          role === 'CHW' ? (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                {t('editDetails')}
              </Button>
              <Link href={`/chw/triage/${patient.id}`}>
                <Button>
                  <Activity className="h-4 w-4" aria-hidden />
                  {t('recordTriage')}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={`/doctor/referrals?patientId=${patient.id}`}>
                <Button variant="outline">
                  <Send className="h-4 w-4" aria-hidden />
                  {t('refer')}
                </Button>
              </Link>
              <Link href={`/doctor/prescriptions/new?patientId=${patient.id}`}>
                <Button>
                  <Stethoscope className="h-4 w-4" aria-hidden />
                  {t('prescribe')}
                </Button>
              </Link>
            </>
          )
        }
      />

      {patient.allergies && (
        <Alert tone="danger" title={tc('allergies')} className="mb-4">
          {patient.allergies}
        </Alert>
      )}

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-5" />

      {tab === 'overview' && <Overview patient={patient} />}
      {tab === 'triage' && <TriageHistory patientId={patient.id} />}
      {tab === 'diary' && <Diary patientId={patient.id} />}
      {tab === 'referrals' && (
        <Referrals patientId={patient.id} newHref={`/${rolePath}/referrals?patientId=${patient.id}`} />
      )}
      {tab === 'plans' && <Plans patientId={patient.id} />}
      {tab === 'visits' && <Visits patientId={patient.id} />}

      {editing && <EditPatient patient={patient} onClose={() => setEditing(false)} />}
    </>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  const tc = useTranslations('common');
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-slate-800">{value || tc('dash')}</p>
    </div>
  );
}

function Overview({ patient }: { patient: Patient }) {
  const { data: history } = useTriageHistory(patient.id);
  const { tone } = useVitalTone();
  const t = useTranslations('record');
  const tc = useTranslations('common');
  const tv = useTranslations('vitals');
  const f = useFormat();
  const latest = history?.vitals?.[0];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader title={tv('latest')} />
          {!latest ? (
            <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
              {t('noVitals')}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <VitalChip
                  label={tv('tempShort')}
                  value={latest.temperature}
                  unit="°C"
                  tone={tone('temperature', latest.temperature)}
                />
                <VitalChip
                  label={tv('spo2')}
                  value={latest.spo2}
                  unit="%"
                  tone={tone('spo2', latest.spo2)}
                />
                <VitalChip
                  label={tv('bpShort')}
                  value={`${latest.bpSystolic}/${latest.bpDiastolic}`}
                  tone={tone('bpSystolic', latest.bpSystolic)}
                />
                <VitalChip
                  label={tv('pulse')}
                  value={latest.pulse}
                  unit="bpm"
                  tone={tone('pulse', latest.pulse)}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {latest.recordedBy
                  ? t('recordedAtBy', {
                      when: f.dateTime(latest.recordedAt),
                      name: latest.recordedBy.fullName,
                    })
                  : t('recordedAt', { when: f.dateTime(latest.recordedAt) })}
              </p>
            </>
          )}
        </Card>

        <Card>
          <CardHeader title={t('medicalBackground')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tc('allergies')} value={patient.allergies} />
            <Field label={t('chronicConditions')} value={patient.chronicConditions} />
            <Field label={t('currentMedications')} value={patient.currentMedications} />
            <Field label={tc('bloodGroup')} value={patient.bloodGroup} />
          </div>
        </Card>

        <Card>
          <CardHeader title={t('contactAddress')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tc('phone')} value={patient.phone} />
            <Field label={tc('altPhone')} value={patient.altPhone} />
            <Field label={tc('address')} value={patient.address} />
            <Field
              label={t('area')}
              value={[patient.village, patient.district].filter(Boolean).join(', ')}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader title={t('emergencyContact')} />
          <div className="space-y-3">
            <Field label={tc('name')} value={patient.emergencyContactName} />
            <Field label={tc('relationship')} value={patient.emergencyContactRelation} />
            <Field label={tc('phone')} value={patient.emergencyContactPhone} />
          </div>
        </Card>

        <Card>
          <CardHeader title={t('registration')} />
          <div className="space-y-3">
            <Field label={tc('registered')} value={f.date(patient.createdAt)} />
            <Field
              label={t('registeredBy')}
              value={
                patient.registeredBy && (
                  <span className="inline-flex items-center gap-2">
                    <Avatar
                      name={patient.registeredBy.fullName}
                      src={patient.registeredBy.profileImage}
                      size="sm"
                    />
                    {patient.registeredBy.fullName}
                  </span>
                )
              }
            />
            <Field
              label={t('portalAccount')}
              value={
                patient.user ? (
                  <Badge tone="green">{t('canSignIn')}</Badge>
                ) : (
                  <Badge tone="gray">{t('chwManaged')}</Badge>
                )
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function TriageHistory({ patientId }: { patientId: number }) {
  const { data, isLoading } = useTriageHistory(patientId);
  const { tone } = useVitalTone();
  const t = useTranslations('record');
  const tc = useTranslations('common');
  const tv = useTranslations('vitals');
  const ts = useTranslations('enums.status');
  const td = useTranslations('enums.duration');
  const tsym = useTranslations('enums.symptom');
  const f = useFormat();

  if (isLoading) return <ListSkeleton rows={4} />;

  const vitals = data?.vitals ?? [];
  const reports = data?.reports ?? [];

  if (!vitals.length && !reports.length) {
    return (
      <Card>
        <EmptyState
          icon={HeartPulse}
          title={t('noTriageTitle')}
          description={t('noTriageBody')}
        />
      </Card>
    );
  }

  const statusLabel = (s: string) => (ts.has(s) ? ts(s) : s.replace(/_/g, ' ').toLowerCase());

  return (
    <div className="space-y-4">
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">
            {t('vitalsHeading')}{' '}
            <span className="font-normal text-slate-400">({f.num(vitals.length)})</span>
          </p>
        </div>
        {!vitals.length ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            {t('nothingRecorded')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  {[
                    t('thWhen'),
                    tv('tempShort'),
                    tv('spo2'),
                    tv('bpShort'),
                    tv('pulse'),
                    tv('respShort'),
                    tv('sugarShort'),
                    t('thBy'),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vitals.map((v) => {
                  const cell = (level: 'normal' | 'warning' | 'critical') =>
                    level === 'critical'
                      ? 'px-4 py-2.5 text-sm font-semibold text-red-600'
                      : level === 'warning'
                        ? 'px-4 py-2.5 text-sm font-semibold text-orange-600'
                        : 'px-4 py-2.5 text-sm text-slate-700';
                  return (
                    <tr key={v.id} className="border-b border-slate-100">
                      <td className="whitespace-nowrap px-4 py-2.5 text-sm text-slate-500">
                        {f.dateTime(v.recordedAt)}
                      </td>
                      <td className={cell(tone('temperature', v.temperature))}>
                        {f.num(v.temperature)}°C
                      </td>
                      <td className={cell(tone('spo2', v.spo2))}>{f.num(v.spo2)}%</td>
                      <td className={cell(tone('bpSystolic', v.bpSystolic))}>
                        {f.digits(`${v.bpSystolic}/${v.bpDiastolic}`)}
                      </td>
                      <td className={cell(tone('pulse', v.pulse))}>{f.num(v.pulse)}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-500">
                        {f.num(v.respiratoryRate)}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-500">
                        {f.num(v.bloodSugar)}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-500">
                        {v.recordedBy?.fullName ?? tc('dash')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title={t('reportsCount', { count: f.num(reports.length) })} />
        {!reports.length ? (
          <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
            {t('nothingRecorded')}
          </p>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {r.primaryComplaint}
                    </p>
                    <p className="text-xs text-slate-500">
                      {f.dateTime(r.recordedAt)}
                      {r.duration &&
                        ` · ${t('forDuration', {
                          duration: td.has(r.duration) ? td(r.duration) : r.duration,
                        })}`}
                      {r.recordedBy && ` · ${r.recordedBy.fullName}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <StatusBadge status={r.severity} />
                    <StatusBadge status={r.triageStatus} />
                  </div>
                </div>
                {Boolean(r.symptoms?.length) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.symptoms.map((s) => (
                      <Badge key={s} tone="gray">
                        {tsym.has(s) ? tsym(s) : s}
                      </Badge>
                    ))}
                  </div>
                )}
                {r.notes && <p className="mt-2 text-xs text-slate-600">{r.notes}</p>}
                {r.suggestedStatus && r.suggestedStatus !== r.triageStatus && (
                  <p className="mt-2 text-xs italic text-slate-400">
                    {t('suggested', {
                      suggested: statusLabel(r.suggestedStatus),
                      recorded: statusLabel(r.triageStatus),
                    })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Diary({ patientId }: { patientId: number }) {
  const { data: entries, isLoading } = usePatientDiary(patientId);
  const { data: summary } = useDiarySummary(patientId, 14);
  const t = useTranslations('record');
  const tc = useTranslations('common');
  const tm = useTranslations('enums.mood');
  const tsym = useTranslations('enums.symptom');
  const f = useFormat();

  if (isLoading) return <ListSkeleton rows={4} />;

  return (
    <div className="space-y-4">
      {summary && summary.entryCount > 0 && (
        <Card>
          <CardHeader title={t('lastDays', { days: f.num(summary.days) })} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-lg font-semibold text-slate-900">
                {f.num(summary.entryCount)}
              </p>
              <p className="text-[11px] text-slate-500">{t('entries')}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-lg font-semibold text-slate-900">
                {f.num(summary.averagePain)}
              </p>
              <p className="text-[11px] text-slate-500">{t('avgPain')}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-lg font-semibold text-slate-900">
                {summary.adherenceRate == null
                  ? tc('dash')
                  : `${f.num(summary.adherenceRate)}%`}
              </p>
              <p className="text-[11px] text-slate-500">{t('tookMedication')}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-900">
                {/*
                  The initial comes off the enum key, not the translated label:
                  taking [0] of a Bangla word slices a codepoint, not a letter.
                  The caption underneath spells the three moods out in full.
                */}
                {(['BETTER', 'SAME', 'WORSE'] as DiaryMood[])
                  .map((m) => `${m[0]}${f.num(summary.moodCounts?.[m] ?? 0)}`)
                  .join(' · ')}
              </p>
              <p className="text-[11px] text-slate-500">{t('moodBreakdown')}</p>
            </div>
          </div>
        </Card>
      )}

      {!entries?.length ? (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title={t('noDiaryTitle')}
            description={t('noDiaryBody')}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <Card key={e.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">{e.note}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {f.dateTime(e.createdAt)}
                    {e.recordedBy &&
                      ` · ${t('loggedBy', { name: e.recordedBy.fullName })}`}
                  </p>
                  {Boolean(e.symptoms?.length) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.symptoms!.map((s) => (
                        <Badge key={s} tone="gray">
                          {tsym.has(s) ? tsym(s) : s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <Badge tone={MOOD_TONE[e.mood]}>
                    {tm.has(e.mood) ? tm(e.mood) : e.mood}
                  </Badge>
                  {e.painLevel != null && (
                    <Badge tone="gray">{t('pain', { value: f.num(e.painLevel) })}</Badge>
                  )}
                  <Badge tone={e.medicationTaken ? 'green' : 'orange'}>
                    {e.medicationTaken ? t('tookMeds') : t('missedMeds')}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Referrals({ patientId, newHref }: { patientId: number; newHref: string }) {
  const { data: referrals, isLoading } = usePatientReferrals(patientId);
  const t = useTranslations('record');
  const ts = useTranslations('enums.status');
  const tu = useTranslations('enums.urgency');
  const f = useFormat();

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!referrals?.length) {
    return (
      <Card>
        <EmptyState
          icon={Send}
          title={t('noReferralsTitle')}
          description={t('noReferralsBody')}
          action={
            <Link href={newHref}>
              <Button size="sm">{t('referThisPatient')}</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {referrals.map((r) => (
        <Card key={r.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{r.facilityName}</p>
              <p className="text-xs text-slate-500">
                {[r.facilityType, r.department].filter(Boolean).join(' · ') ||
                  t('noDepartment')}
                {' · '}
                {f.date(r.createdAt)}
              </p>
              <p className="mt-2 text-sm text-slate-700">{r.reason}</p>
              {r.clinicalSummary && (
                <p className="mt-1 text-xs text-slate-500">{r.clinicalSummary}</p>
              )}
              {r.outcome && (
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  {t('outcomeLabel')}: {r.outcome}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {t('referredBy', { name: r.referredBy?.fullName ?? t('unknown') })}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Badge tone={URGENCY_TONE[r.urgency]}>
                {tu.has(r.urgency) ? tu(r.urgency) : r.urgency}
              </Badge>
              <Badge
                tone={
                  r.status === 'COMPLETED'
                    ? 'green'
                    : r.status === 'CANCELLED'
                      ? 'gray'
                      : r.status === 'ACKNOWLEDGED'
                        ? 'blue'
                        : 'orange'
                }
              >
                {ts.has(r.status) ? ts(r.status) : r.status}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Plans({ patientId }: { patientId: number }) {
  const { toast } = useToast();
  const { data: plans, isLoading } = useTreatmentPlans(patientId);
  const create = useCreateTreatmentPlan();
  const t = useTranslations('record');
  const tc = useTranslations('common');
  const f = useFormat();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', details: '', startDate: '', endDate: '' });

  const submit = () => {
    if (!form.title.trim() || !form.details.trim()) {
      return toast(t('vTitleDetails'), 'error');
    }
    if (!form.startDate || !form.endDate) return toast(t('vDates'), 'error');
    if (form.endDate < form.startDate) {
      return toast(t('vDateOrder'), 'error');
    }
    create.mutate(
      {
        patientId,
        title: form.title.trim(),
        details: form.details.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      },
      {
        onSuccess: () => {
          toast(t('planCreated'));
          setOpen(false);
          setForm({ title: '', details: '', startDate: '', endDate: '' });
        },
        onError: (e) => toast(apiError(e, t('planFailed')), 'error'),
      },
    );
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <CalendarClock className="h-3.5 w-3.5" aria-hidden />
          {t('newPlan')}
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : !plans?.length ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title={t('noPlansTitle')}
            description={t('noPlansBody')}
            action={
              <Button size="sm" onClick={() => setOpen(true)}>
                {t('createFirstPlan')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((p) => (
            <Card key={p.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    {f.date(p.startDate)} → {f.date(p.endDate)}
                    {p.doctor && ` · ${p.doctor.fullName}`}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {p.details}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('newPlanTitle')}
        width="max-w-lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button onClick={submit} loading={create.isPending}>
              {t('createPlan')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('planTitle')}
            required
            placeholder={t('planTitlePlaceholder')}
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            label={t('planDetails')}
            required
            rows={5}
            placeholder={t('planDetailsPlaceholder')}
            value={form.details}
            onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('startDate')}
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
            />
            <Input
              label={t('endDate')}
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

function Visits({ patientId }: { patientId: number }) {
  const { data: visits, isLoading } = useVisits({ patientId });
  const t = useTranslations('record');
  const to = useTranslations('enums.visitOutcome');
  const f = useFormat();

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!visits?.length) {
    return (
      <Card>
        <EmptyState
          icon={Footprints}
          title={t('noVisitsTitle')}
          description={t('noVisitsBody')}
          action={
            <Link href={`/chw/visits?patientId=${patientId}`}>
              <Button size="sm">{t('logVisit')}</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {visits.map((v) => (
        <Card key={v.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {to.has(v.outcome) ? to(v.outcome) : v.outcome.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-slate-500">
                {f.date(v.visitDate)}
                {v.village && ` · ${v.village}`}
                {v.travelMinutes != null &&
                  ` · ${t('travel', { minutes: f.num(v.travelMinutes) })}`}
              </p>
              {v.notes && <p className="mt-2 text-sm text-slate-700">{v.notes}</p>}
            </div>
            {v.followUpNeeded && <Badge tone="orange">{t('followUpNeeded')}</Badge>}
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Values the API stores; labels come from `enums.gender`. */
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

function EditPatient({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const { toast } = useToast();
  const update = useUpdatePatient(patient.id);
  const t = useTranslations('record');
  const tc = useTranslations('common');
  const tg = useTranslations('enums.gender');
  const [form, setForm] = useState({
    fullName: patient.fullName,
    dob: patient.dob?.slice(0, 10) ?? '',
    gender: patient.gender,
    bloodGroup: patient.bloodGroup ?? '',
    phone: patient.phone,
    altPhone: patient.altPhone ?? '',
    address: patient.address,
    village: patient.village ?? '',
    district: patient.district ?? '',
    emergencyContactName: patient.emergencyContactName,
    emergencyContactRelation: patient.emergencyContactRelation ?? '',
    emergencyContactPhone: patient.emergencyContactPhone,
    allergies: patient.allergies ?? '',
    chronicConditions: patient.chronicConditions ?? '',
    currentMedications: patient.currentMedications ?? '',
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      return toast(t('vRequired'), 'error');
    }
    if (!form.emergencyContactName.trim() || !form.emergencyContactPhone.trim()) {
      return toast(t('vEmergency'), 'error');
    }

    // the MRN is not in the DTO, so it stays as issued no matter what we send
    update.mutate(
      {
        fullName: form.fullName.trim(),
        dob: form.dob,
        gender: form.gender,
        phone: form.phone.trim(),
        address: form.address.trim(),
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
        bloodGroup: form.bloodGroup.trim(),
        altPhone: form.altPhone.trim(),
        village: form.village.trim(),
        district: form.district.trim(),
        emergencyContactRelation: form.emergencyContactRelation.trim(),
        allergies: form.allergies.trim(),
        chronicConditions: form.chronicConditions.trim(),
        currentMedications: form.currentMedications.trim(),
      },
      {
        onSuccess: () => {
          toast(t('updated'));
          onClose();
        },
        onError: (e) => toast(apiError(e, t('saveFailed')), 'error'),
      },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('editPatient', { name: patient.fullName })}
      width="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button onClick={submit} loading={update.isPending}>
            {tc('saveChanges')}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('fullName')}
            required
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
          />
          <Input
            label={t('dob')}
            type="date"
            required
            value={form.dob}
            onChange={(e) => set('dob', e.target.value)}
          />
          <Select
            label={tc('gender')}
            required
            value={form.gender}
            onChange={(e) => set('gender', e.target.value)}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {tg.has(g) ? tg(g) : g}
              </option>
            ))}
          </Select>
          <Input
            label={tc('bloodGroup')}
            placeholder="O+"
            value={form.bloodGroup}
            onChange={(e) => set('bloodGroup', e.target.value)}
          />
          <Input
            label={tc('phone')}
            required
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          <Input
            label={tc('altPhone')}
            value={form.altPhone}
            onChange={(e) => set('altPhone', e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={tc('address')}
            required
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
          <Input
            label={tc('village')}
            value={form.village}
            onChange={(e) => set('village', e.target.value)}
          />
          <Input
            label={tc('district')}
            value={form.district}
            onChange={(e) => set('district', e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label={t('emergencyContact')}
            required
            value={form.emergencyContactName}
            onChange={(e) => set('emergencyContactName', e.target.value)}
          />
          <Input
            label={tc('relationship')}
            placeholder={t('relationPlaceholder')}
            value={form.emergencyContactRelation}
            onChange={(e) => set('emergencyContactRelation', e.target.value)}
          />
          <Input
            label={t('contactPhone')}
            required
            value={form.emergencyContactPhone}
            onChange={(e) => set('emergencyContactPhone', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Textarea
            label={tc('allergies')}
            rows={2}
            placeholder={t('allergiesPlaceholder')}
            value={form.allergies}
            onChange={(e) => set('allergies', e.target.value)}
          />
          <Textarea
            label={t('chronicConditions')}
            rows={2}
            placeholder={t('chronicPlaceholder')}
            value={form.chronicConditions}
            onChange={(e) => set('chronicConditions', e.target.value)}
          />
          <Textarea
            label={t('currentMedications')}
            rows={2}
            placeholder={t('medsPlaceholder')}
            value={form.currentMedications}
            onChange={(e) => set('currentMedications', e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
