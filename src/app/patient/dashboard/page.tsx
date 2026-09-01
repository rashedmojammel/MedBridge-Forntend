'use client';

import Link from 'next/link';
import {
  BookHeart,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  Pill,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useAppointments } from '@/hooks/useAppointments';
import { useConsultations } from '@/hooks/useConsultations';
import { usePatientStats } from '@/hooks/useStats';
import { useCurrentUser } from '@/hooks/useAuth';
import { useFormat } from '@/hooks/useFormat';

export default function PatientDashboardPage() {
  const user = useCurrentUser();
  // /stats/patient returns null when the account has no patient record behind it
  const { data: stats, isLoading: statsLoading } = usePatientStats();
  const { data: prescriptions, isLoading: rxLoading } = usePrescriptions();
  const { data: appointments, isLoading: apptLoading } = useAppointments('upcoming');
  const { data: consultations } = useConsultations();
  const t = useTranslations('patient');
  const tc = useTranslations('common');
  const f = useFormat();

  const nextAppt = appointments?.[0];
  const openConsult = (consultations ?? []).find((c) => c.status !== 'COMPLETED');
  const unlinked = !statsLoading && stats === null;

  return (
    <>
      <PageHeader
        title={t('dashboard.welcome', {
          name: user?.fullName?.split(' ')[0] ?? t('dashboard.fallbackName'),
        })}
        subtitle={
          stats?.mrn
            ? t('dashboard.mrnSubtitle', { mrn: f.digits(stats.mrn) })
            : t('dashboard.subtitle')
        }
      />

      {unlinked && (
        <Alert tone="info" className="mb-4" title={t('dashboard.unlinkedTitle')}>
          {t('dashboard.unlinkedBody')}
        </Alert>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading || apptLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={CalendarDays}
              value={f.num(appointments?.length ?? 0)}
              label={t('dashboard.statUpcoming')}
              tone="purple"
              hint={
                nextAppt ? f.dateTime(nextAppt.scheduledAt) : t('dashboard.noneScheduled')
              }
              index={0}
            />
            <StatCard
              icon={Pill}
              value={f.num(stats?.prescriptions.active ?? 0)}
              label={t('dashboard.statActiveRx')}
              hint={t('dashboard.rxTotalHint', {
                count: f.num(stats?.prescriptions.total ?? 0),
              })}
              tone="green"
              index={1}
              action={
                <Link href="/patient/prescriptions" className="text-xs font-medium text-blue-600">
                  {tc('viewAll')}
                </Link>
              }
            />
            <StatCard
              icon={ClipboardList}
              value={f.num(stats?.consultations ?? 0)}
              label={t('dashboard.statConsultations')}
              tone="blue"
              index={2}
            />
            <StatCard
              icon={MessageSquare}
              value={openConsult ? t('dashboard.open') : tc('dash')}
              label={t('dashboard.statActiveConsult')}
              tone="orange"
              index={3}
              action={
                openConsult ? (
                  <Link href={`/patient/consultation/${openConsult.id}`}>
                    <Button size="sm">{t('dashboard.joinChat')}</Button>
                  </Link>
                ) : undefined
              }
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t('dashboard.recentRx')}
            action={
              <Link href="/patient/prescriptions" className="text-xs font-medium text-blue-600">
                {tc('viewAll')}
              </Link>
            }
          />
          {rxLoading ? (
            <ListSkeleton rows={3} />
          ) : !prescriptions?.length ? (
            <EmptyState
              icon={Pill}
              title={t('dashboard.noRxTitle')}
              description={t('dashboard.noRxBody')}
            />
          ) : (
            <div className="space-y-2">
              {prescriptions.slice(0, 4).map((rx) => (
                <Link
                  key={rx.id}
                  href={`/patient/prescriptions/${rx.id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {t('rxNumber', { id: f.digits(rx.id) })}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {rx.doctor?.fullName} · {f.date(rx.issuedAt)}
                    </p>
                  </div>
                  <StatusBadge status={rx.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title={t('dashboard.upcomingAppts')}
            action={
              <Link href="/patient/appointments" className="text-xs font-medium text-blue-600">
                {tc('viewAll')}
              </Link>
            }
          />
          {apptLoading ? (
            <ListSkeleton rows={3} />
          ) : !appointments?.length ? (
            <EmptyState
              icon={ClipboardList}
              title={t('dashboard.noApptTitle')}
              description={t('dashboard.noApptBody')}
            />
          ) : (
            <div className="space-y-2">
              {appointments.slice(0, 4).map((a) => {
                const tile = f.tile(a.scheduledAt);
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="rounded-lg bg-purple-50 px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-purple-700">{tile.day}</p>
                      <p className="text-[10px] font-medium text-purple-600">{tile.month}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {a.doctor?.fullName}
                      </p>
                      <p className="text-xs text-slate-500">{f.dateTime(a.scheduledAt)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title={t('dashboard.betweenTitle')} />
        <p className="text-sm text-slate-600">{t('dashboard.betweenBody')}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link href="/patient/diary">
            <Button variant="outline" fullWidth>
              <BookHeart className="h-4 w-4" aria-hidden />
              {t('dashboard.healthDiary')}
            </Button>
          </Link>
          <Link href="/patient/medicines">
            <Button variant="outline" fullWidth>
              <Search className="h-4 w-4" aria-hidden />
              {t('dashboard.lookUpMedicine')}
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
