'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Bike,
  CalendarCheck,
  ExternalLink,
  Footprints,
  MapPin,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import PatientPicker from '@/components/shared/PatientPicker';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  useCreateVisit,
  useDeleteVisit,
  useVisitStats,
  useVisits,
} from '@/hooks/useVisits';
import { usePatient } from '@/hooks/usePatients';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';
import type { FieldVisit, Patient, VisitOutcome } from '@/types';

/**
 * The CHW's own round: who was visited, what came of it, and how much of the
 * day went on travel. The list endpoint is CHW and admin only.
 */

/** Value and tone only - the label comes from `enums.visitOutcome`. */
const OUTCOMES: { value: VisitOutcome; tone: 'blue' | 'green' | 'orange' | 'purple' | 'gray' }[] = [
  { value: 'ROUTINE_CHECK', tone: 'blue' },
  { value: 'TRIAGE_DONE', tone: 'green' },
  { value: 'REFERRED', tone: 'purple' },
  { value: 'FOLLOW_UP_NEEDED', tone: 'orange' },
  { value: 'NOT_HOME', tone: 'gray' },
];

const outcomeTone = (o: VisitOutcome) => OUTCOMES.find((x) => x.value === o)?.tone ?? 'gray';

const RANGES = [7, 30, 90];

/**
 * `<input type="date">` and the from/to filters both want YYYY-MM-DD.
 *
 * Built from the local date parts by hand rather than through `Intl`: the result
 * is a query parameter, so it stays ASCII whatever the display locale.
 */
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function VisitsLog() {
  const { toast } = useToast();
  const params = useSearchParams();
  const patientIdParam = params.get('patientId');
  const t = useTranslations('chw.visits');
  const tc = useTranslations('common');
  const to = useTranslations('enums.visitOutcome');
  const f = useFormat();

  const [days, setDays] = useState(30);
  const [logging, setLogging] = useState(false);
  const [target, setTarget] = useState<FieldVisit | null>(null);

  // a patient filter arrives from that patient's record
  const patientFilter = patientIdParam ? Number(patientIdParam) : undefined;
  const { data: prefilled } = usePatient(patientIdParam ?? undefined);

  const from = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return isoDate(d);
  }, [days]);

  const { data: visits, isLoading } = useVisits({
    from,
    ...(patientFilter ? { patientId: patientFilter } : {}),
  });
  const { data: stats } = useVisitStats(days);
  const remove = useDeleteVisit();

  // group by day so a round reads as a round, not a flat list
  const byDay = useMemo(() => {
    const groups = new Map<string, FieldVisit[]>();
    for (const v of visits ?? []) {
      const key = v.visitDate.slice(0, 10);
      groups.set(key, [...(groups.get(key) ?? []), v]);
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [visits]);

  const villages = Object.entries(stats?.byVillage ?? {}).sort((a, b) => b[1] - a[1]);
  const topVillage = villages[0]?.[1] ?? 0;

  const drop = () => {
    if (!target) return;
    remove.mutate(target.id, {
      onSuccess: () => {
        toast(t('removed'));
        setTarget(null);
      },
      onError: (e) => toast(apiError(e, t('removeFailed')), 'error'),
    });
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Button onClick={() => setLogging(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            {t('log')}
          </Button>
        }
      />

      {patientFilter && (
        <Alert tone="info" className="mb-4">
          {t('filteredTo', { name: prefilled?.fullName ?? t('onePatient') })}{' '}
          <Link href="/chw/visits" className="font-medium underline">
            {t('showEveryone')}
          </Link>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{t('last')}</span>
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDays(r)}
                className={
                  days === r
                    ? 'rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white'
                    : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200'
                }
              >
                {t('daysRange', { count: f.num(r) })}
              </button>
            ))}
          </div>

          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : !byDay.length ? (
            <Card>
              <EmptyState
                icon={Footprints}
                title={t('emptyTitle')}
                description={t('emptyBody', { days: f.num(days) })}
                action={
                  <Button size="sm" onClick={() => setLogging(true)}>
                    {t('log')}
                  </Button>
                }
              />
            </Card>
          ) : (
            byDay.map(([date, dayVisits]) => (
              <Card key={date}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{f.date(date)}</p>
                  {/* raw count - ICU picks the plural form and localises the digit */}
                  <Badge tone="gray">{t('visitCount', { count: dayVisits.length })}</Badge>
                </div>

                <ul className="space-y-2">
                  {dayVisits.map((v) => (
                    <li
                      key={v.id}
                      className="flex flex-wrap items-start gap-3 rounded-lg border border-slate-200 p-3"
                    >
                      <Avatar name={v.patient?.fullName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {v.patient?.fullName ?? tc('unknownPatient')}
                        </p>
                        <p className="truncate font-mono text-xs text-slate-500">
                          {f.digits(v.patient?.mrn)}
                        </p>
                        {v.notes && (
                          <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">
                            {v.notes}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {v.village && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" aria-hidden />
                              {v.village}
                            </span>
                          )}
                          {typeof v.travelMinutes === 'number' && (
                            <span className="flex items-center gap-1">
                              <Bike className="h-3 w-3" aria-hidden />
                              {t('travel', { count: f.num(v.travelMinutes) })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge tone={outcomeTone(v.outcome)}>
                          {to.has(v.outcome) ? to(v.outcome) : v.outcome}
                        </Badge>
                        {v.followUpNeeded && (
                          <Badge tone="orange" dot>
                            {t('followUp')}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Link href={`/chw/patients/${v.patient?.id}`}>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                              {t('record')}
                            </Button>
                          </Link>
                          <button
                            type="button"
                            aria-label={t('removeAria', {
                              name: v.patient?.fullName ?? tc('unknownPatient'),
                            })}
                            onClick={() => setTarget(v)}
                            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('statsTitle', { days: f.num(stats?.days ?? days) })} />
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-slate-900">
                  {f.num(stats?.totalVisits ?? 0)}
                </p>
                <p className="text-[11px] text-slate-500">{t('statVisits')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-slate-900">
                  {f.num(stats?.uniquePatients ?? 0)}
                </p>
                <p className="text-[11px] text-slate-500">{t('statPeople')}</p>
              </div>
              <div className="rounded-lg bg-orange-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-orange-700">
                  {f.num(stats?.followUpsPending ?? 0)}
                </p>
                <p className="text-[11px] text-orange-600">{t('statFollowUps')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-slate-900">
                  {t('hours', { count: f.num(Math.round((stats?.travelMinutes ?? 0) / 60)) })}
                </p>
                <p className="text-[11px] text-slate-500">{t('statHours')}</p>
              </div>
            </div>
          </Card>

          {villages.length > 0 && (
            <Card>
              <CardHeader title={t('whereTitle')} />
              <ul className="space-y-2.5">
                {villages.slice(0, 6).map(([village, count]) => (
                  <li key={village}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="truncate font-medium text-slate-700">{village}</span>
                      <span className="text-slate-400">{f.num(count)}</span>
                    </div>
                    <ProgressBar value={count} max={topVillage} tone="blue" />
                  </li>
                ))}
              </ul>
              {villages.length > 6 && (
                <p className="mt-3 text-xs text-slate-400">
                  {t('andMore', { count: f.num(villages.length - 6) })}
                </p>
              )}
            </Card>
          )}

          {Object.keys(stats?.byOutcome ?? {}).length > 0 && (
            <Card>
              <CardHeader title={t('howTitle')} />
              <ul className="space-y-2">
                {OUTCOMES.filter((o) => stats?.byOutcome?.[o.value]).map((o) => (
                  <li key={o.value} className="flex items-center justify-between text-sm">
                    <Badge tone={o.tone}>{to(o.value)}</Badge>
                    <span className="font-medium text-slate-700">
                      {f.num(stats?.byOutcome?.[o.value] ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <CardHeader title={t('whyTitle')} />
            <p className="flex items-start gap-1.5 text-xs text-slate-500">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('whyBody')}
            </p>
          </Card>
        </div>
      </div>

      {logging && (
        <LogVisit prefilled={prefilled ?? null} onClose={() => setLogging(false)} />
      )}

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={drop}
        loading={remove.isPending}
        danger
        title={t('removeTitle')}
        confirmLabel={t('removeConfirm')}
        description={t('removeBody', {
          name: target?.patient?.fullName ?? tc('unknownPatient'),
          date: f.date(target?.visitDate),
        })}
      />
    </>
  );
}

function LogVisit({
  prefilled,
  onClose,
}: {
  prefilled: Patient | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const create = useCreateVisit();
  const t = useTranslations('chw.visits');
  const tc = useTranslations('common');
  const to = useTranslations('enums.visitOutcome');

  const [patient, setPatient] = useState<Patient | null>(prefilled);
  const [visitDate, setVisitDate] = useState(isoDate(new Date()));
  const [outcome, setOutcome] = useState<VisitOutcome>('ROUTINE_CHECK');
  const [village, setVillage] = useState(prefilled?.village ?? '');
  const [travelMinutes, setTravelMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);

  useEffect(() => {
    if (!prefilled) return;
    setPatient(prefilled);
    setVillage((v) => v || prefilled.village || '');
  }, [prefilled]);

  // picking the patient fills the village in from their record
  const choose = (p: Patient) => {
    setPatient(p);
    if (p.village) setVillage(p.village);
  };

  const submit = () => {
    if (!patient) return toast(t('pickPatient'), 'error');
    if (!visitDate) return toast(t('pickDate'), 'error');

    const minutes = travelMinutes.trim() ? Number(travelMinutes) : undefined;
    if (minutes !== undefined && (!Number.isInteger(minutes) || minutes < 0)) {
      return toast(t('travelWhole'), 'error');
    }

    // built field by field - the API rejects unknown properties
    create.mutate(
      {
        patientId: patient.id,
        visitDate,
        outcome,
        followUpNeeded,
        ...(village.trim() ? { village: village.trim() } : {}),
        ...(minutes !== undefined ? { travelMinutes: minutes } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast(t('logged'));
          onClose();
        },
        onError: (e) => toast(apiError(e, t('logFailed')), 'error'),
      },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('modalTitle')}
      width="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            <CalendarCheck className="h-4 w-4" aria-hidden />
            {t('logVisit')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">{tc('patient')}</p>
          <PatientPicker
            selected={patient}
            onSelect={choose}
            onClear={() => setPatient(null)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('dateVisited')}
            type="date"
            required
            max={isoDate(new Date())}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />
          <Select
            label={t('outcome')}
            required
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as VisitOutcome)}
          >
            {OUTCOMES.map((o) => (
              <option key={o.value} value={o.value}>
                {to(o.value)}
              </option>
            ))}
          </Select>
          <Input
            label={tc('village')}
            placeholder={t('villagePlaceholder')}
            value={village}
            onChange={(e) => setVillage(e.target.value)}
          />
          <Input
            label={t('travelTime')}
            type="number"
            min={0}
            placeholder="25"
            hint={t('travelHint')}
            value={travelMinutes}
            onChange={(e) => setTravelMinutes(e.target.value)}
          />
        </div>

        <Textarea
          label={tc('notes')}
          rows={3}
          placeholder={t('notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
            checked={followUpNeeded}
            onChange={(e) => setFollowUpNeeded(e.target.checked)}
          />
          <span className="text-sm">
            <span className="font-medium text-slate-800">{t('needsFollowUp')}</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {t('needsFollowUpHint')}
            </span>
          </span>
        </label>

        {outcome === 'NOT_HOME' && (
          <Alert tone="info" className="rounded-lg">
            {t('notHomeNote')}
          </Alert>
        )}
      </div>
    </Modal>
  );
}

export default function ChwVisitsPage() {
  // reading ?patientId needs a suspense boundary to prerender
  return (
    <Suspense fallback={<ListSkeleton rows={5} />}>
      <VisitsLog />
    </Suspense>
  );
}
