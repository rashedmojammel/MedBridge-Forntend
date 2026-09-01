'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, Stethoscope, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { usePatients } from '@/hooks/usePatients';
import { useDebounce } from '@/hooks/useDebounce';
import { ageFrom, formatDate } from '@/lib/utils';

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data: patients, isLoading } = usePatients(debounced);

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Everyone registered on the platform, searchable by MRN, name, or phone."
      />

      <div className="mb-4 max-w-md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by MRN, name, or phone..."
        />
      </div>

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : !patients?.length ? (
          <EmptyState
            icon={Users}
            title={search ? 'No matches' : 'No patients yet'}
            description={
              search
                ? 'Try the MRN or a phone number.'
                : 'Patients are registered by community health workers.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  {['MRN', 'Name', 'Age / gender', 'Area', 'Registered', 'Actions'].map((h) => (
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
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {p.mrn}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {p.fullName}
                          </p>
                          {p.chronicConditions && (
                            <Badge tone="orange" className="mt-0.5">
                              Chronic
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {ageFrom(p.dob) ?? '—'} / {p.gender?.[0]}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {p.village ?? p.district ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Link href={`/doctor/patients/${p.id}`}>
                          <Button size="sm" variant="ghost">
                            <Stethoscope className="h-3.5 w-3.5" aria-hidden />
                            Chart
                          </Button>
                        </Link>
                        <Link href={`/doctor/prescriptions/new?patientId=${p.id}`}>
                          <Button size="sm" variant="outline">
                            <FileText className="h-3.5 w-3.5" aria-hidden />
                            Prescribe
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
