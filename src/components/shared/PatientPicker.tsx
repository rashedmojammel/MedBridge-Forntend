'use client';

import { useState } from 'react';
import { Users, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import SearchBar from '@/components/shared/SearchBar';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { usePatients } from '@/hooks/usePatients';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormat } from '@/hooks/useFormat';
import { ageFrom } from '@/lib/utils';
import type { Patient } from '@/types';

/** Search-and-pick over the patients the signed-in user is allowed to see. */
export default function PatientPicker({
  onSelect,
  selected,
  onClear,
}: {
  onSelect: (patient: Patient) => void;
  selected?: Patient | null;
  onClear?: () => void;
}) {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data: patients, isLoading } = usePatients(debounced);
  const t = useTranslations('pickers');
  const tc = useTranslations('common');
  const tg = useTranslations('enums.gender');
  const f = useFormat();

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
        <Avatar name={selected.fullName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{selected.fullName}</p>
          <p className="truncate font-mono text-xs text-slate-500">{f.digits(selected.mrn)}</p>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label={t('changePatient')}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <SearchBar value={search} onChange={setSearch} placeholder={t('patientPlaceholder')} />

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : !patients?.length ? (
        <EmptyState
          icon={Users}
          title={search ? tc('noMatches') : t('noPatientsTitle')}
          description={search ? tc('tryAnotherSearch') : t('noPatientsBody')}
        />
      ) : (
        <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-1.5">
          {patients.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <Avatar name={p.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{p.fullName}</p>
                <p className="truncate font-mono text-xs text-slate-500">{f.digits(p.mrn)}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {/*
                  The whole gender word rather than its first letter: taking [0]
                  of a Bangla label slices a codepoint off a word, not an initial.
                */}
                {f.num(ageFrom(p.dob))} /{' '}
                {p.gender && tg.has(p.gender) ? tg(p.gender) : p.gender}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
