'use client';

import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  Footprints,
  Send,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { usePatients } from '@/hooks/usePatients';
import { useConsultations } from '@/hooks/useConsultations';
import { useChwStats } from '@/hooks/useStats';
import { useCurrentUser } from '@/hooks/useAuth';
import { useFormat } from '@/hooks/useFormat';

export default function ChwDashboardPage() {
  const user = useCurrentUser();
  const { data: stats, isLoading: statsLoading } = useChwStats();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const { data: consultations, isLoading: consultLoading } = useConsultations();
  const t = useTranslations('chw.dashboard');
  const tc = useTranslations('common');
  const tn = useTranslations('nav.chw');
  const f = useFormat();

  const today = new Date().toDateString();
  const todays = (consultations ?? []).filter(
    (c) => new Date(c.scheduledAt).toDateString() === today,
  );
  const critical = stats?.criticalAwaitingConsultation ?? 0;

  return (
    <>
      <PageHeader
        title={t('welcome', {
          name: user?.fullName?.split(' ')[0] ?? t('fallbackName'),
        })}
        subtitle={t('subtitle')}
        action={
          <Link href="/chw/patients/new">
            <Button>
              <UserPlus className="h-4 w-4" aria-hidden />
              {tn('registerPatient')}
            </Button>
          </Link>
        }
      />

      {!statsLoading && critical > 0 && (
        <Alert tone="danger" title={t('criticalTitle')} className="mb-4">
          {critical === 1
            ? t('criticalOne')
            : t('criticalMany', { count: f.num(critical) })}{' '}
          <Link href="/chw/schedule" className="font-medium underline">
            {t('arrange')}
          </Link>
        </Alert>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={Users}
              value={f.num(stats?.patients.total ?? 0)}
              label={t('statPatients')}
              hint={t('patientsHint', {
                count: f.num(stats?.patients.newInPeriod ?? 0),
                days: f.num(stats?.periodDays ?? 30),
              })}
              tone="blue"
              index={0}
            />
            <StatCard
              icon={CalendarCheck}
              value={f.num(todays.length)}
              label={t('statToday')}
              tone="green"
              index={1}
            />
            <StatCard
              icon={Activity}
              value={f.num(stats?.consultationsScheduled ?? 0)}
              label={t('statAwaiting')}
              tone="orange"
              index={2}
            />
            <StatCard
              icon={AlertTriangle}
              value={f.num(critical)}
              label={t('statUnbooked')}
              tone="red"
              index={3}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t('todayTitle')}
            action={
              <Link href="/chw/schedule" className="text-xs font-medium text-blue-600">
                {t('scheduleNew')}
              </Link>
            }
          />
          {consultLoading ? (
            <ListSkeleton rows={3} />
          ) : todays.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={t('noneTodayTitle')}
              description={t('noneTodayBody')}
            />
          ) : (
            <div className="space-y-2">
              {todays.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {f.time(c.scheduledAt)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {c.patient?.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {f.digits(c.patient?.mrn)} · {c.doctor?.fullName}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title={t('recentPatients')}
            action={
              <Link href="/chw/patients" className="text-xs font-medium text-blue-600">
                {tc('viewAll')}
              </Link>
            }
          />
          {patientsLoading ? (
            <ListSkeleton rows={4} />
          ) : !patients?.length ? (
            <EmptyState
              icon={Users}
              title={t('noPatientsTitle')}
              description={t('noPatientsBody')}
              action={
                <Link href="/chw/patients/new">
                  <Button size="sm">{tn('registerPatient')}</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {patients.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/chw/triage/${p.id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300"
                >
                  <Avatar name={p.fullName} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {p.fullName}
                    </p>
                    <p className="truncate font-mono text-xs text-slate-500">
                      {f.digits(p.mrn)}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    {tn('triage')}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title={t('shortcuts')} />
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/chw/visits">
            <Button variant="outline" fullWidth>
              <Footprints className="h-4 w-4" aria-hidden />
              {t('logVisit')}
            </Button>
          </Link>
          <Link href="/chw/referrals">
            <Button variant="outline" fullWidth>
              <Send className="h-4 w-4" aria-hidden />
              {tn('referrals')}
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
