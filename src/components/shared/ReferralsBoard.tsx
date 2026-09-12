'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Plus,
  Send,
  Stethoscope,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import PatientPicker from '@/components/shared/PatientPicker';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
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
import { useCreateReferral, useReferrals, useUpdateReferral } from '@/hooks/useReferrals';
import { usePatient } from '@/hooks/usePatients';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';
import type { Patient, Referral, ReferralStatus, ReferralUrgency } from '@/types';

const URGENCIES: ReferralUrgency[] = ['ROUTINE', 'URGENT', 'EMERGENCY'];

const URGENCY_TONE: Record<ReferralUrgency, 'gray' | 'orange' | 'red'> = {
  ROUTINE: 'gray',
  URGENT: 'orange',
  EMERGENCY: 'red',
};


const FACILITY_TYPE_KEYS = [
  'DISTRICT_HOSPITAL',
  'HEALTH_CENTRE',
  'MEDICAL_COLLEGE',
  'PRIVATE_HOSPITAL',
  'DIAGNOSTIC_CENTRE',
  'SPECIALIST_CLINIC',
];

const TABS: (ReferralStatus | 'all')[] = [
  'all',
  'PENDING',
  'ACKNOWLEDGED',
  'COMPLETED',
  'CANCELLED',
];

function Board({ role }: { role: 'DOCTOR' | 'CHW' }) {
  const { toast } = useToast();
  const params = useSearchParams();
  const patientIdParam = params.get('patientId');
  const t = useTranslations('referrals');
  const tc = useTranslations('common');
  const ts = useTranslations('enums.status');
  const tu = useTranslations('enums.urgency');
  const f = useFormat();

  const [tab, setTab] = useState<ReferralStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [closing, setClosing] = useState<Referral | null>(null);

  const { data: referrals, isLoading } = useReferrals(tab === 'all' ? undefined : tab);
  const { data: prefilled } = usePatient(patientIdParam ?? undefined);
  const update = useUpdateReferral();

  useEffect(() => {
    if (patientIdParam) setCreating(true);
  }, [patientIdParam]);

  const term = search.trim().toLowerCase();
  const visible = (referrals ?? []).filter((r) =>
    !term
      ? true
      : [r.patient?.fullName, r.patient?.mrn, r.facilityName, r.department]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(term)),
  );

  const pending = (referrals ?? []).filter((r) => r.status === 'PENDING').length;
  const emergencies = (referrals ?? []).filter(
    (r) => r.urgency === 'EMERGENCY' && r.status === 'PENDING',
  ).length;

  const statusLabel = (s: string) => (ts.has(s) ? ts(s) : s.replace(/_/g, ' '));

  const setStatus = (referral: Referral, status: ReferralStatus) => {
    update.mutate(
      { id: referral.id, status },
      {
        onSuccess: () => toast(t('markedStatus', { status: statusLabel(status) })),
        onError: (e) => toast(apiError(e, t('updateFailed')), 'error'),
      },
    );
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={role === 'DOCTOR' ? t('subtitleDoctor') : t('subtitleChw')}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            {t('newReferral')}
          </Button>
        }
      />

      {emergencies > 0 && (
        <Alert tone="danger" title={t('openEmergencyTitle')} className="mb-4">
          {}
          {t('openEmergencyBody', { count: emergencies })}
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs
          tabs={TABS.map((key) => ({
            key,
            label: key === 'all' ? tc('all') : statusLabel(key),
            ...(key === 'PENDING' && pending ? { count: pending } : {}),
          }))}
          active={tab}
          onChange={(k) => setTab(k as typeof tab)}
        />
        <div className="min-w-[14rem] flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !visible.length ? (
        <Card>
          <EmptyState
            icon={Send}
            title={
              term
                ? tc('noMatches')
                : tab === 'all'
                  ? t('noneYetTitle')
                  : t('nothingHereTitle')
            }
            description={
              term
                ? t('noMatchesBody')
                : tab === 'all'
                  ? t('noneYetBody')
                  : t('noneInTab', { status: statusLabel(tab) })
            }
            action={
              !term && tab === 'all' ? (
                <Button size="sm" onClick={() => setCreating(true)}>
                  {t('raiseOne')}
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={r.patient?.fullName} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {r.patient?.fullName ?? tc('unknownPatient')}
                    </p>
                    <p className="truncate font-mono text-xs text-slate-500">
                      {f.digits(r.patient?.mrn)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <Badge tone={URGENCY_TONE[r.urgency]} dot>
                    {tu.has(r.urgency) ? tu(r.urgency) : r.urgency}
                  </Badge>
                  <StatusBadge status={r.status} />
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{r.facilityName}</p>
                  <p className="text-xs text-slate-500">
                    {[r.facilityType, r.department].filter(Boolean).join(' · ') ||
                      t('noDepartmentGiven')}
                  </p>
                </div>
              </div>

              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {tc('reason')}
                  </dt>
                  <dd className="mt-0.5 text-slate-700">{r.reason}</dd>
                </div>
                {r.clinicalSummary && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t('clinicalSummary')}
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-slate-600">
                      {r.clinicalSummary}
                    </dd>
                  </div>
                )}
                {r.outcome && (
                  <div className="rounded-lg border-l-2 border-l-green-600 bg-green-50 px-3 py-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-green-700">
                      {t('outcome')}
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-green-900">{r.outcome}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <p className="mr-auto text-xs text-slate-400">
                  {t('raised', { date: f.date(r.createdAt), ago: f.relative(r.createdAt) })}
                  {r.consultation &&
                    ` · ${t('fromConsultation', { id: f.num(r.consultation.id) })}`}
                </p>

                <Link href={`/${role.toLowerCase()}/patients/${r.patient?.id}`}>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    {t('recordBtn')}
                  </Button>
                </Link>

                {r.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={update.isPending}
                    onClick={() => setStatus(r, 'ACKNOWLEDGED')}
                  >
                    {t('acknowledge')}
                  </Button>
                )}
                {(r.status === 'PENDING' || r.status === 'ACKNOWLEDGED') && (
                  <>
                    <Button size="sm" onClick={() => setClosing(r)}>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      {t('closeWithOutcome')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={update.isPending}
                      onClick={() => setStatus(r, 'CANCELLED')}
                    >
                      {tc('cancel')}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {creating && (
        <NewReferral
          role={role}
          prefilled={prefilled ?? null}
          onClose={() => setCreating(false)}
        />
      )}

      {closing && <CloseReferral referral={closing} onClose={() => setClosing(null)} />}
    </>
  );
}

function NewReferral({
  role,
  prefilled,
  onClose,
}: {
  role: 'DOCTOR' | 'CHW';
  prefilled: Patient | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const create = useCreateReferral();
  const t = useTranslations('referrals');
  const tc = useTranslations('common');
  const tu = useTranslations('enums.urgency');

  const [patient, setPatient] = useState<Patient | null>(prefilled);
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [urgency, setUrgency] = useState<ReferralUrgency>('ROUTINE');

  useEffect(() => {
    if (prefilled) setPatient(prefilled);
  }, [prefilled]);

  const submit = () => {
    if (!patient) return toast(t('vPatient'), 'error');
    if (!facilityName.trim()) return toast(t('vFacility'), 'error');
    if (reason.trim().length < 4) return toast(t('vReason'), 'error');

    create.mutate(
      {
        patientId: patient.id,
        facilityName: facilityName.trim(),
        reason: reason.trim(),
        urgency,
        ...(facilityType.trim() ? { facilityType: facilityType.trim() } : {}),
        ...(department.trim() ? { department: department.trim() } : {}),
        ...(clinicalSummary.trim() ? { clinicalSummary: clinicalSummary.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast(t('sent'));
          onClose();
        },
        onError: (e) => toast(apiError(e, t('createFailed')), 'error'),
      },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('newTitle')}
      width="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            <Send className="h-4 w-4" aria-hidden />
            {t('send')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">{tc('patient')}</p>
          <PatientPicker
            selected={patient}
            onSelect={setPatient}
            onClear={() => setPatient(null)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('facility')}
            required
            placeholder={t('facilityPlaceholder')}
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
          />
          <Input
            label={t('facilityTypeLabel')}
            list="referral-facility-types"
            placeholder={t('facilityTypes.DISTRICT_HOSPITAL')}
            value={facilityType}
            onChange={(e) => setFacilityType(e.target.value)}
          />
          {}
          <datalist id="referral-facility-types">
            {FACILITY_TYPE_KEYS.map((k) => (
              <option key={k} value={t(`facilityTypes.${k}`)} />
            ))}
          </datalist>
          <Input
            label={t('department')}
            placeholder={t('departmentPlaceholder')}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <Select
            label={t('urgency')}
            required
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as ReferralUrgency)}
          >
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {tu.has(u) ? tu(u) : u}
              </option>
            ))}
          </Select>
        </div>

        <Alert
          tone={urgency === 'EMERGENCY' ? 'danger' : urgency === 'URGENT' ? 'warning' : 'info'}
          className="rounded-lg"
        >
          {t(`urgencyNote.${urgency}`)}
        </Alert>

        <Input
          label={tc('reason')}
          required
          placeholder={t('reasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <Textarea
          label={t('clinicalSummary')}
          rows={4}
          placeholder={
            role === 'DOCTOR'
              ? t('summaryPlaceholderDoctor')
              : t('summaryPlaceholderChw')
          }
          value={clinicalSummary}
          onChange={(e) => setClinicalSummary(e.target.value)}
        />
        <p className="flex items-start gap-1.5 text-xs text-slate-500">
          <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {t('handoffNote')}
        </p>
      </div>
    </Modal>
  );
}

function CloseReferral({
  referral,
  onClose,
}: {
  referral: Referral;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const update = useUpdateReferral();
  const t = useTranslations('referrals');
  const tc = useTranslations('common');
  const [outcome, setOutcome] = useState(referral.outcome ?? '');

  const submit = () => {
    if (outcome.trim().length < 4) {
      return toast(t('vOutcome'), 'error');
    }
    update.mutate(
      { id: referral.id, status: 'COMPLETED', outcome: outcome.trim() },
      {
        onSuccess: () => {
          toast(t('closed'));
          onClose();
        },
        onError: (e) => toast(apiError(e, t('closeFailed')), 'error'),
      },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('closeTitle')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button onClick={submit} loading={update.isPending}>
            {t('markCompleted')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Card padded={false} className="bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">{referral.patient?.fullName}</p>
          <p className="text-xs text-slate-500">
            {referral.facilityName}
            {referral.department && ` · ${referral.department}`}
          </p>
        </Card>

        <Textarea
          label={t('whatCameBack')}
          required
          rows={4}
          placeholder={t('outcomePlaceholder')}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        />
        <p className="text-xs text-slate-500">{t('outcomeNote')}</p>
      </div>
    </Modal>
  );
}

export default function ReferralsBoard({ role }: { role: 'DOCTOR' | 'CHW' }) {
  return (
    <Suspense fallback={<ListSkeleton rows={4} />}>
      <Board role={role} />
    </Suspense>
  );
}
