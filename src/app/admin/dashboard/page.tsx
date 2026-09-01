'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  FileSearch,
  MapPin,
  MessageSquare,
  Pill,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Badge, { RoleBadge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { useUsers } from '@/hooks/useUsers';
import { useAdminStats } from '@/hooks/useStats';

export default function AdminDashboardPage() {
  // every counter is a SQL aggregate; the user list is only the newest few
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading } = useUsers();

  const userList = Array.isArray(users) ? users : [];
  const lowStock = stats?.medicines.lowStock ?? 0;
  const districts = stats?.byDistrict ?? [];
  const topDistrict = districts[0]?.count ?? 0;

  const careTeam = [
    { label: 'Doctors', value: stats?.users.doctors ?? 0 },
    { label: 'Health workers', value: stats?.users.chws ?? 0 },
    { label: 'Pharmacists', value: stats?.users.pharmacists ?? 0 },
  ];

  return (
    <>
      <PageHeader
        title="Platform overview"
        subtitle="Users, patients, medicines, and system alerts."
        action={
          <Link href="/admin/users/new">
            <Button>Add user</Button>
          </Link>
        }
      />

      {lowStock > 0 && (
        <Alert tone="warning" className="mb-4" title="Inventory attention needed">
          {lowStock === 1
            ? 'One medicine is below its stock threshold.'
            : `${lowStock} medicines are below their stock threshold.`}{' '}
          <Link href="/admin/medicines" className="font-medium underline">
            Review medicines
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
              value={stats?.users.total ?? 0}
              label="User accounts"
              hint={`${stats?.users.doctors ?? 0} doctors · ${stats?.users.chws ?? 0} CHWs · ${stats?.users.pharmacists ?? 0} pharmacists`}
              tone="blue"
              index={0}
            />
            <StatCard
              icon={ShieldCheck}
              value={stats?.patients.total ?? 0}
              label="Patient records"
              hint={`${stats?.patients.newInPeriod ?? 0} new in the last ${stats?.periodDays ?? 30} days`}
              tone="green"
              index={1}
            />
            <StatCard
              icon={MessageSquare}
              value={stats?.consultations.total ?? 0}
              label="Consultations"
              hint={`${stats?.consultations.inPeriod ?? 0} in the last ${stats?.periodDays ?? 30} days`}
              tone="purple"
              index={2}
            />
            <StatCard
              icon={AlertTriangle}
              value={lowStock}
              label="Stock alerts"
              hint={`of ${stats?.medicines.total ?? 0} medicines`}
              tone="orange"
              index={3}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent users"
            action={
              <Link href="/admin/users" className="text-xs font-medium text-blue-600">
                Manage users
              </Link>
            }
          />
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : !userList.length ? (
            <EmptyState icon={Users} title="No users yet" />
          ) : (
            <div className="space-y-2">
              {userList.slice(0, 6).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <Avatar name={u.fullName} src={u.profileImage} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {u.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                  <Badge tone={u.isActive ? 'green' : 'gray'} dot>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Patients by district" />
            {statsLoading ? (
              <ListSkeleton rows={4} />
            ) : !districts.length ? (
              <EmptyState
                icon={MapPin}
                title="No patients registered"
                description="District figures appear once CHWs start registering patients."
              />
            ) : (
              <div className="space-y-3">
                {districts.map((d) => (
                  <div key={d.district}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-sm text-slate-700">{d.district}</span>
                      <span className="text-sm font-semibold text-slate-900">{d.count}</span>
                    </div>
                    <ProgressBar value={d.count} max={topDistrict || 1} tone="blue" />
                  </div>
                ))}
                <p className="pt-1 text-xs text-slate-500">
                  Top ten districts. Patients registered without a district are grouped as
                  Unrecorded.
                </p>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Care team" />
            <div className="space-y-2.5">
              {careTeam.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden />
                    <span className="text-sm text-slate-700">{row.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Triage load" />
            <p className="text-sm text-slate-600">
              <span className="text-lg font-semibold text-slate-900">
                {stats?.criticalReports ?? 0}
              </span>{' '}
              symptom reports have been graded critical since the platform went live. The
              threshold that decides that grade is editable in settings.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link href="/admin/settings">
                <Button variant="outline" size="sm" fullWidth>
                  <SlidersHorizontal className="h-4 w-4" aria-hidden />
                  Settings
                </Button>
              </Link>
              <Link href="/admin/audit">
                <Button variant="outline" size="sm" fullWidth>
                  <FileSearch className="h-4 w-4" aria-hidden />
                  Audit log
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader title="Prescribing" />
        <p className="text-sm text-slate-600">
          {stats?.prescriptions.total ?? 0} prescriptions have been written in total,{' '}
          {stats?.prescriptions.inPeriod ?? 0} of them in the last {stats?.periodDays ?? 30}{' '}
          days. Dispensing is the only prescription action written to the audit log.
        </p>
        <div className="mt-3">
          <Link href="/admin/medicines">
            <Button variant="outline" size="sm">
              <Pill className="h-4 w-4" aria-hidden />
              Medicines and stock
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
