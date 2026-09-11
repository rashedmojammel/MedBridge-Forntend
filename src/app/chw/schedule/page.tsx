'use client';

import { useState } from 'react';
import { CalendarDays, CalendarPlus, Clock, Stethoscope } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import PatientPicker from '@/components/shared/PatientPicker';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useConsultations, useCreateConsultation } from '@/hooks/useConsultations';
import { useDoctorSlots } from '@/hooks/useAvailability';
import { usePublicDoctors } from '@/hooks/useUsers';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';
import type { Patient } from '@/types';

/**
 * `<input type="date">` wants YYYY-MM-DD, and so does the slots endpoint.
 *
 * Deliberately hand-built from the local date parts rather than through `Intl`:
 * this is a key the API parses, so it stays ASCII whatever the display locale.
 */
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export default function ChwSchedulePage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [search, setSearch] = useState('');
  const { data: consultations, isLoading } = useConsultations();
  const t = useTranslations('chw.schedule');
  const tc = useTranslations('common');
  const tsp = useTranslations('enums.specialization');
  const f = useFormat();

  const [booking, setBooking] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const { data: doctors } = usePublicDoctors();
  // `doctorId` state holds the Users.id (what booking needs). The slots
  // endpoint keys off the Doctors profile id instead, same as the public
  // doctor-profile route - so look the selected doctor back up for that one.
  const selectedDoctor = doctors?.find((d) => String(d.id) === doctorId);
  // the doctor's real free times for that date, already minus what is booked
  const { data: day, isFetching: slotsLoading } = useDoctorSlots(selectedDoctor?.doctorId, date);

  const create = useCreateConsultation();

  const today = isoDate(new Date());
  const freeSlots = day?.slots ?? [];
  const noSlots = Boolean(doctorId && date && !slotsLoading && !freeSlots.length);

  // ConsultationsController has no upcoming/past filter param - split client-side.
  const now = Date.now();
  const byTab = (consultations ?? []).filter((c) =>
    tab === 'upcoming' ? new Date(c.scheduledAt).getTime() >= now : new Date(c.scheduledAt).getTime() < now,
  );
  const visible = byTab.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.patient?.fullName?.toLowerCase().includes(q) ||
      c.patient?.mrn?.toLowerCase().includes(q) ||
      c.doctor?.fullName?.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setPatient(null);
    setDoctorId('');
    setDate('');
    setTime('');
    setReason('');
  };

  const submit = () => {
    if (!patient) return toast(t('pickPatient'), 'error');
    if (!doctorId) return toast(t('pickDoctor'), 'error');
    if (!date || !time) return toast(t('pickDateTime'), 'error');
    if (reason.trim().length < 4) return toast(t('reasonRequired'), 'error');

    // local wall-clock in, UTC instant out - the API stores a timestamptz
    const scheduledAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(scheduledAt.getTime())) return toast(t('invalidTime'), 'error');

    create.mutate(
      {
        patientId: patient.id,
        doctorId: Number(doctorId),
        scheduledAt: scheduledAt.toISOString(),
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast(t('booked', { name: patient.fullName }));
          setBooking(false);
          resetForm();
        },
        onError: (e) => toast(apiError(e, t('bookFailed')), 'error'),
      },
    );
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Button onClick={() => setBooking(true)}>
            <CalendarPlus className="h-4 w-4" aria-hidden />
            {t('book')}
          </Button>
        }
      />

      <Tabs
        tabs={[
          { key: 'upcoming', label: tc('upcoming') },
          { key: 'past', label: tc('past') },
        ]}
        active={tab}
        onChange={(k) => setTab(k as typeof tab)}
        className="mb-4"
      />

      <div className="mb-4 max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder={t('placeholder')} />
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !visible.length ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title={
              search
                ? t('noMatchTitle')
                : tab === 'upcoming'
                  ? t('emptyUpcomingTitle')
                  : t('emptyPastTitle')
            }
            description={
              search
                ? t('noMatchBody')
                : tab === 'upcoming'
                  ? t('emptyUpcomingBody')
                  : t('emptyPastBody')
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((c) => {
            const cancelled = c.status === 'CANCELLED';
            const tile = f.tile(c.scheduledAt);
            return (
              <Card key={c.id}>
                <div className="flex flex-wrap items-center gap-4">
                  <div
                    className={
                      cancelled
                        ? 'rounded-lg bg-slate-100 px-4 py-2.5 text-center'
                        : 'rounded-lg bg-green-50 px-4 py-2.5 text-center'
                    }
                  >
                    <p
                      className={
                        cancelled
                          ? 'text-lg font-semibold leading-none text-slate-500'
                          : 'text-lg font-semibold leading-none text-green-700'
                      }
                    >
                      {tile.day}
                    </p>
                    <p
                      className={
                        cancelled
                          ? 'mt-1 text-[10px] font-medium text-slate-400'
                          : 'mt-1 text-[10px] font-medium text-green-600'
                      }
                    >
                      {tile.month}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {c.patient?.fullName}
                      <span className="ml-2 font-mono text-xs font-normal text-slate-400">
                        {f.digits(c.patient?.mrn)}
                      </span>
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        {f.dateTime(c.scheduledAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" aria-hidden />
                        {c.doctor?.fullName ?? t('unassigned')}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">{c.reason}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={booking}
        onClose={() => setBooking(false)}
        title={t('modalTitle')}
        width="max-w-lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBooking(false)}>
              {tc('cancel')}
            </Button>
            <Button onClick={submit} loading={create.isPending}>
              {t('book')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-700">{tc('patient')}</p>
            <PatientPicker
              selected={patient}
              onSelect={setPatient}
              onClear={() => setPatient(null)}
            />
          </div>

          <Select
            label={tc('doctor')}
            required
            value={doctorId}
            onChange={(e) => {
              setDoctorId(e.target.value);
              setTime('');
            }}
          >
            <option value="">{t('chooseDoctor')}</option>
            {(doctors ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName} —{' '}
                {d.specialization && tsp.has(d.specialization)
                  ? tsp(d.specialization)
                  : d.specialization}
              </option>
            ))}
          </Select>

          <Input
            label={tc('date')}
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTime('');
            }}
          />

          {doctorId && date && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-700">{tc('time')}</p>
              {slotsLoading ? (
                <p className="text-sm text-slate-500">{t('checkingDiary')}</p>
              ) : freeSlots.length ? (
                <div className="grid grid-cols-4 gap-2">
                  {freeSlots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTime(s)}
                      className={
                        time === s
                          ? 'rounded-lg border-2 border-blue-500 bg-blue-50 py-2 text-xs font-semibold text-blue-700'
                          : 'rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300'
                      }
                    >
                      {/* the label localises; `s` itself stays the value we post */}
                      {f.digits(s)}
                    </button>
                  ))}
                </div>
              ) : null}

              {/*
                A doctor who has never filled in a weekly pattern has no slots to
                offer, which must not stop a CHW booking - so fall back to a plain
                time field and say why.
              */}
              {noSlots && (
                <>
                  <Alert tone="warning" className="mb-3 rounded-lg">
                    {t('noSlots', { reason: day?.reason ?? t('noSlotsFallback') })}
                  </Alert>
                  <Input
                    label={tc('time')}
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </>
              )}
            </div>
          )}

          <Textarea
            label={t('reasonLabel')}
            required
            rows={3}
            placeholder={t('reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <p className="text-xs text-slate-400">{t('bookFootnote')}</p>
        </div>
      </Modal>
    </>
  );
}