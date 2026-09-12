'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileSearch,
  KeyRound,
  PackageCheck,
  Pencil,
  PlusCircle,
  Send,
  ShieldCheck,
  Trash2,
  Eye,
  LogIn,
} from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { RoleBadge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useAuditLog } from '@/hooks/useAudit';
import { formatDateTime, timeAgo } from '@/lib/utils';
import type { AuditAction, UserRole } from '@/types';


const ACTIONS: {
  value: AuditAction;
  label: string;
  icon: typeof Eye;
  tone: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}[] = [
  { value: 'CREATE', label: 'Created', icon: PlusCircle, tone: 'green' },
  { value: 'UPDATE', label: 'Updated', icon: Pencil, tone: 'blue' },
  { value: 'DELETE', label: 'Deleted', icon: Trash2, tone: 'red' },
  { value: 'DISPENSE', label: 'Dispensed', icon: PackageCheck, tone: 'purple' },
  { value: 'VIEW', label: 'Viewed', icon: Eye, tone: 'gray' },
  { value: 'LOGIN', label: 'Signed in', icon: LogIn, tone: 'gray' },
  { value: 'LOGIN_FAILED', label: 'Sign-in failed', icon: KeyRound, tone: 'orange' },
];

const actionMeta = (a: AuditAction) => ACTIONS.find((x) => x.value === a);

const RESOURCES: { value: string; label: string; icon: typeof Send }[] = [
  { value: 'auth', label: 'Passwords', icon: KeyRound },
  { value: 'prescriptions', label: 'Dispensing', icon: PackageCheck },
  { value: 'referrals', label: 'Referrals', icon: Send },
];

const PAGE_SIZES = [25, 50, 100, 200];

export default function AdminAuditPage() {
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useAuditLog({
    resource,
    action,
    from,
    to: to ? `${to}T23:59:59` : '',
    page,
    limit,
  });

  const filtered = Boolean(resource || action || from || to);

  const change = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const clear = () => {
    setResource('');
    setAction('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const items = data?.items ?? [];
  const pages = data?.pages ?? 1;

  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Who did what, and when. Read-only and append-only — entries cannot be edited or removed."
        action={
          filtered ? (
            <Button variant="ghost" onClick={clear}>
              Clear filters
            </Button>
          ) : undefined
        }
      />

      <Alert tone="info" title="What is recorded" className="mb-4">
        Password changes and resets, medicine dispensed at the counter, and referrals raised or
        updated. Consultations, prescriptions being written, patient registrations, and user
        administration are <strong>not</strong> written to this trail.
      </Alert>

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="Resource"
            value={resource}
            onChange={(e) => change(() => setResource(e.target.value))}
          >
            <option value="">All resources</option>
            {RESOURCES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <Select
            label="Action"
            value={action}
            onChange={(e) => change(() => setAction(e.target.value))}
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => change(() => setFrom(e.target.value))}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => change(() => setTo(e.target.value))}
          />
          <Select
            label="Per page"
            value={String(limit)}
            onChange={(e) => change(() => setLimit(Number(e.target.value)))}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} rows
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : !items.length ? (
        <Card>
          <EmptyState
            icon={FileSearch}
            title={filtered ? 'Nothing matches' : 'The trail is empty'}
            description={
              filtered
                ? 'Widen the dates, or clear the filters to see everything.'
                : 'Nothing auditable has happened yet. Dispense a prescription or raise a referral and it will appear here.'
            }
            action={
              filtered ? (
                <Button size="sm" onClick={clear}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <Card padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Who</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Resource</th>
                    <th className="px-4 py-3 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row) => {
                    const meta = actionMeta(row.action);
                    const Icon = meta?.icon ?? Eye;
                    const resourceMeta = RESOURCES.find((r) => r.value === row.resource);
                    return (
                      <tr key={row.id} className="align-top hover:bg-slate-50/60">
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="text-slate-800">{formatDateTime(row.createdAt)}</p>
                          <p className="text-xs text-slate-400">{timeAgo(row.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={row.actor?.fullName ?? row.actorEmail ?? '?'}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-slate-800">
                                {row.actor?.fullName ?? 'Deleted account'}
                              </p>
                              <p className="truncate text-xs text-slate-400">
                                {row.actorEmail ?? row.actor?.email ?? '—'}
                              </p>
                            </div>
                          </div>
                          {row.actorRole && (
                            <div className="mt-1">
                              <RoleBadge role={row.actorRole as UserRole} />
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge tone={meta?.tone ?? 'gray'}>
                            <Icon className="h-3 w-3" aria-hidden />
                            {meta?.label ?? row.action}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="text-slate-800">
                            {resourceMeta?.label ?? row.resource}
                          </p>
                          {row.resourceId !== undefined && row.resourceId !== null && (
                            <p className="font-mono text-xs text-slate-400">
                              #{row.resourceId}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-600">{row.detail || '—'}</p>
                          {row.ip && (
                            <p className="mt-0.5 font-mono text-xs text-slate-400">{row.ip}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {data?.total ?? 0} entr{(data?.total ?? 0) === 1 ? 'y' : 'ies'} · page {page} of{' '}
              {pages}
              {isFetching && ' · loading'}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                Newer
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Older
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        </>
      )}

      <Card className="mt-4">
        <CardHeader title="Reading the trail" />
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="text-slate-300">—</span>
            The email and role are copied in at the time of the event, so they survive the
            account being changed or deactivated afterwards.
          </li>
          <li className="flex gap-2">
            <span className="text-slate-300">—</span>
            Password entries never contain the password itself, old or new.
          </li>
          <li className="flex gap-2">
            <span className="text-slate-300">—</span>
            Newest first, always. The trail is append-only — an absence of entries is itself
            evidence.
          </li>
        </ul>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Only administrators can read this. Nothing here is exportable from the interface.
        </p>
      </Card>
    </>
  );
}
