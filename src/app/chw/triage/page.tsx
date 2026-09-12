'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { usePatients } from '@/hooks/usePatients';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormat } from '@/hooks/useFormat';
import { ageFrom } from '@/lib/utils';

export default function TriageIndexPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data: patients, isLoading } = usePatients(debounced);
  const t = useTranslations('chw.triageIndex');
  const tc = useTranslations('common');
  const tn = useTranslations('nav.chw');
  const tg = useTranslations('enums.gender');
  const f = useFormat();

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Alert tone="info" title={t('escalateTitle')} className="mb-5">
        {t('escalateBody')}
      </Alert>

      <div className="mb-4 max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder={t('placeholder')} />
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : !patients?.length ? (
        <Card>
          <EmptyState
            icon={Users}
            title={search ? tc('noMatches') : t('noPatientsTitle')}
            description={search ? t('noMatchesBody') : t('noPatientsBody')}
            action={
              !search && (
                <Button size="sm" onClick={() => router.push('/chw/patients/new')}>
                  {tn('registerPatient')}
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {patients.map((p) => (
            <Card key={p.id} padded={false}>
              <button
                onClick={() => router.push(`/chw/triage/${p.id}`)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
              >
                <Avatar name={p.fullName} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {p.fullName}
                  </p>
                  <p className="truncate font-mono text-xs text-slate-500">
                    {f.digits(p.mrn)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {f.num(ageFrom(p.dob))} {t('yrs')} ·{' '}
                    {p.gender && tg.has(p.gender) ? tg(p.gender) : p.gender} ·{' '}
                    {p.village ?? p.district ?? tc('dash')}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                  <Activity className="h-3.5 w-3.5" aria-hidden />
                  {tc('start')}
                </span>
              </button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
