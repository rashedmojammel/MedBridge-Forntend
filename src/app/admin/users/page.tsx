'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge, { RoleBadge } from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useUsers, useSetUserActive } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { apiError } from '@/lib/api';

const TABS = [
  { key: '', label: 'All' },
  { key: 'DOCTOR', label: 'Doctors' },
  { key: 'CHW', label: 'Health workers' },
  { key: 'PHARMACIST', label: 'Pharmacists' },
  { key: 'PATIENT', label: 'Patients' },
  { key: 'ADMIN', label: 'Admins' },
];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [target, setTarget] = useState<{ id: number; fullName: string; isActive: boolean } | null>(
    null,
  );

  const { data: users, isLoading } = useUsers({
    role: role || undefined,
    search: debounced || undefined,
  });
  const setActive = useSetUserActive();

  return (
    <>
      <PageHeader
        title="User management"
        subtitle="Create and manage staff accounts."
        action={
          <Link href="/admin/users/new">
            <Button>
              <UserPlus className="h-4 w-4" aria-hidden />
              Add user
            </Button>
          </Link>
        }
      />

      <Tabs tabs={TABS} active={role} onChange={setRole} className="mb-4" />

      <div className="mb-4 max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
      </div>

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : !users?.length ? (
          <EmptyState icon={Users} title="No users found" description="Try a different filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.fullName} src={u.profileImage} size="sm" />
                        <span className="text-sm font-medium text-slate-900">
                          {u.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.isActive ? 'green' : 'gray'} dot>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/admin/users/${u.id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={u.isActive ? 'text-red-600' : 'text-green-700'}
                          onClick={() =>
                            setTarget({
                              id: u.id,
                              fullName: u.fullName,
                              isActive: Boolean(u.isActive),
                            })
                          }
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        loading={setActive.isPending}
        danger={target?.isActive}
        title={target?.isActive ? 'Deactivate this user?' : 'Reactivate this user?'}
        description={
          target?.isActive
            ? `${target.fullName} will no longer be able to sign in. Their consultations, prescriptions, and audit trail stay intact — accounts are never deleted.`
            : `${target?.fullName} will be able to sign in again.`
        }
        confirmLabel={target?.isActive ? 'Deactivate' : 'Reactivate'}
        onConfirm={() =>
          setActive.mutate(
            { id: target!.id, isActive: !target!.isActive },
            {
              onSuccess: () => {
                toast(target!.isActive ? 'User deactivated' : 'User reactivated');
                setTarget(null);
              },
              onError: (e) => toast(apiError(e), 'error'),
            },
          )
        }
      />
    </>
  );
}
