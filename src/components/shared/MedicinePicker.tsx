'use client';

import { useState } from 'react';
import { Pill, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import SearchBar from '@/components/shared/SearchBar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useMedicineSearch } from '@/hooks/useMedicines';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormat } from '@/hooks/useFormat';
import type { Medicine } from '@/types';

/**
 * Type-to-search medicine picker. The catalogue has no list-all endpoint by
 * design (it is far too large), so searching is the only way in - the empty
 * state says so rather than looking broken.
 */
export default function MedicinePicker({
  onSelect,
  selected,
  onClear,
  placeholder,
}: {
  onSelect: (medicine: Medicine) => void;
  selected?: Medicine | null;
  onClear?: () => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query);
  const { data: medicines, isLoading } = useMedicineSearch(debounced);
  const t = useTranslations('pickers');
  const tc = useTranslations('common');
  const f = useFormat();

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
        <Pill className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{selected.brandName}</p>
          <p className="truncate text-xs text-slate-500">
            {selected.genericName} · {selected.strength}
          </p>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label={t('changeMedicine')}
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
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder={placeholder ?? t('medicinePlaceholder')}
      />

      {debounced.trim().length < 2 ? (
        <p className="flex items-center gap-1.5 px-1 text-xs text-slate-400">
          <Search className="h-3 w-3" aria-hidden />
          {t('typeTwo')}
        </p>
      ) : isLoading ? (
        <ListSkeleton rows={3} />
      ) : !medicines?.length ? (
        <p className="px-1 text-xs text-slate-500">{t('noMedicines')}</p>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-1.5">
          {medicines.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelect(m);
                setQuery('');
              }}
              className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{m.brandName}</p>
                <p className="truncate text-xs text-slate-500">
                  {m.genericName} · {m.dosageForm} {m.strength}
                </p>
              </div>
              {m.inventory && (
                <Badge tone={m.inventory.stockQty > m.inventory.threshold ? 'green' : 'orange'}>
                  {t('inStock', { count: f.num(m.inventory.stockQty) })}
                </Badge>
              )}
              {!m.isAvailable && <Badge tone="red">{tc('unavailable')}</Badge>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact variant for pages that already have their own layout for results. */
export function MedicinePickerButton({
  medicine,
  onClick,
}: {
  medicine?: Medicine | null;
  onClick: () => void;
}) {
  const t = useTranslations('pickers');
  return (
    <Button type="button" variant="secondary" onClick={onClick} fullWidth>
      <Pill className="h-4 w-4" aria-hidden />
      {medicine ? medicine.brandName : t('chooseMedicine')}
    </Button>
  );
}
