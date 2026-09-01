'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  CalendarDays,
  ClipboardPen,
  FileText,
  MessageSquare,
  Send,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { useConsultations } from '@/hooks/useConsultations';
import { useDoctorStats } from '@/hooks/useStats';
import { useCurrentUser } from '@/hooks/useAuth';
import { formatTime } from '@/lib/utils';

export default function DoctorDashboardPage() {
  const user = useCurrentUser();
  // counters are aggregated in SQL; the lists below are only what fits on screen
  const { data: stats, isLoading: statsLoading } = useDoctorStats();
  const { data: consultations, isLoading } = useConsultations();

  const today = new Date().toDateString();
  const todays = (consultations ?? []).filter(
    (c) => new Date(c.scheduledAt).toDateString() === today,
  );

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.fullName ?? 'Doctor'}`}
        subtitle="Your consultations, patients, and prescriptions."
      />

      {!statsLoading && (stats?.consultations.pendingDiagnosis ?? 0) > 0 && (
        <Alert tone="warning" title="Consultations closed without a diagnosis" className="mb-4">
          {stats!.consultations.pendingDiagnosis === 1
            ? 'One completed consultation has no diagnosis recorded.'
            : `${stats!.consultations.pendingDiagnosis} completed consultations have no diagnosis recorded.`}{' '}
          The patient and the next clinician both read that field.
        </Alert>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={CalendarDays}
              value={stats?.consultations.today ?? 0}
              label="Today's consultations"
              tone="blue"
              index={0}
            />
            <StatCard
              icon={Users}
              value={stats?.uniquePatients ?? 0}
              label="Patients seen"
              hint="Distinct patients, all time"
              tone="green"
              index={1}
            />
            <StatCard
              icon={AlertTriangle}
              value={stats?.consultations.pendingDiagnosis ?? 0}
              label="Awaiting a diagnosis"
              tone="orange"
              index={2}
            />
            <StatCard
              icon={FileText}
              value={stats?.prescriptions.total ?? 0}
              label="Prescriptions issued"
              hint={`${stats?.prescriptions.inPeriod ?? 0} in the last ${stats?.periodDays ?? 30} days`}
              tone="purple"
              index={3}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Today's schedule" />
          {isLoading ? (
            <ListSkeleton rows={4} />
          ) : todays.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No consultations today"
              description="Scheduled consultations will appear here."
              action={
                <Link href="/doctor/availability">
                  <Button size="sm" variant="outline">
                    Check your consulting hours
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {todays.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <span className="w-16 shrink-0 text-xs font-medium text-slate-400">
                    {formatTime(c.scheduledAt)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {c.patient?.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{c.reason}</p>
                  </div>
                  <Link href={`/doctor/consultation/${c.id}`}>
                    <Button size="sm" variant={c.status === 'COMPLETED' ? 'ghost' : 'primary'}>
                      {c.status === 'COMPLETED' ? 'View' : 'Start'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recent consultations"
            action={
              <Link href="/doctor/prescriptions/new" className="text-xs font-medium text-blue-600">
                Write prescription
              </Link>
            }
          />
          {isLoading ? (
            <ListSkeleton rows={4} />
          ) : !consultations?.length ? (
            <EmptyState
              icon={MessageSquare}
              title="No consultations yet"
              description="Consultations assigned to you appear here."
            />
          ) : (
            <div className="space-y-2">
              {consultations.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/doctor/consultation/${c.id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {c.patient?.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {c.diagnosis || c.reason}
                    </p>
                  </div>
                  <Badge tone={c.status === 'COMPLETED' ? 'green' : 'blue'}>
                    {c.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Shortcuts" />
        <div className="grid gap-2 sm:grid-cols-3">
          <Link href="/doctor/templates">
            <Button variant="outline" fullWidth>
              <ClipboardPen className="h-4 w-4" aria-hidden />
              Prescription templates
            </Button>
          </Link>
          <Link href="/doctor/referrals">
            <Button variant="outline" fullWidth>
              <Send className="h-4 w-4" aria-hidden />
              Referrals
            </Button>
          </Link>
          <Link href="/doctor/availability">
            <Button variant="outline" fullWidth>
              <CalendarDays className="h-4 w-4" aria-hidden />
              Consulting hours
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
