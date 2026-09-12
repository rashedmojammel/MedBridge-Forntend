'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { usePatients } from '@/hooks/usePatients';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormat } from '@/hooks/useFormat';
import { ageFrom } from '@/lib/utils';

export default function ChwPatientsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data: patients, isLoading } = usePatients(debounced);
  const t = useTranslations('chw.patients');
  const tc = useTranslations('common');
  const tn = useTranslations('nav.chw');
  const tg = useTranslations('enums.gender');
  const f = useFormat();

  const columns = [
    tc('mrn'),
    tc('name'),
    t('colAgeGender'),
    tc('registered'),
    tc('actions'),
  ];
  

  return (
    <>
      <PageHeader
        title={t('title')}
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

      <div className="mb-4 max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder={t('placeholder')} />
      </div>

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : !patients?.length ? (
          <EmptyState
            icon={Users}
            title={search ? tc('noMatches') : t('noPatientsTitle')}
            description={search ? tc('tryAnotherSearch') : t('noPatientsBody')}
            action={
              !search && (
                <Link href="/chw/patients/new">
                  <Button size="sm">{tn('registerPatient')}</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  {columns.map((h) => (
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
                  <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {f.digits(p.mrn)}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.fullName} size="sm" />
                        <span className="text-sm font-medium text-slate-900">
                          {p.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {f.num(ageFrom(p.dob))} /{' '}
                      {p.gender && tg.has(p.gender) ? tg(p.gender) : p.gender}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {f.date(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Link href={`/chw/patients/${p.id}`}>
                          <Button size="sm" variant="ghost">
                            {tc('view')}
                          </Button>
                        </Link>
                        <Link href={`/chw/triage/${p.id}`}>
                          <Button size="sm">
                            <Activity className="h-3.5 w-3.5" aria-hidden />
                            {tn('triage')}
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
