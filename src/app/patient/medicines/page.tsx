'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useMedicineSearch, useAlternatives } from '@/hooks/useMedicines';
import { useDebounce } from '@/hooks/useDebounce';

export default function MedicineSearchPage() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query);
  const { data: medicines, isLoading } = useMedicineSearch(debounced);
  const t = useTranslations('patient.medicines');
  const tc = useTranslations('common');

  const [altFor, setAltFor] = useState<number | null>(null);
  const { data: alternatives, isLoading: altLoading } = useAlternatives(altFor ?? undefined);

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="mb-5 max-w-xl">
        <SearchBar value={query} onChange={setQuery} placeholder={t('placeholder')} />
      </div>

      {debounced.length < 2 ? (
        <Card>
          <EmptyState
            icon={Search}
            title={t('promptTitle')}
            description={t('promptBody')}
          />
        </Card>
      ) : isLoading ? (
        <ListSkeleton rows={5} />
      ) : !medicines?.length ? (
        <Card>
          <EmptyState
            icon={Pill}
            title={t('noneTitle')}
            description={t('noneBody')}
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {medicines.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
            >
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{m.brandName}</p>
                    <p className="text-xs text-slate-500">
                      {m.genericName}
                      {m.manufacturer ? ` · ${m.manufacturer}` : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="gray">{m.dosageForm}</Badge>
                      <Badge tone="gray">{m.strength}</Badge>
                      <Badge tone={m.isAvailable ? 'green' : 'red'}>
                        {m.isAvailable ? tc('available') : tc('unavailable')}
                      </Badge>
                    </div>
                  </div>
                  {m.therapeuticClass && (
                    <Badge tone="blue">{m.therapeuticClass}</Badge>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <Button size="sm" variant="outline" onClick={() => setAltFor(m.id)}>
                    {t('viewAlternatives')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={altFor !== null} onClose={() => setAltFor(null)} title={t('altTitle')}>
        {altLoading ? (
          <ListSkeleton rows={3} />
        ) : !alternatives?.length ? (
          <p className="py-6 text-center text-sm text-slate-500">{t('altNone')}</p>
        ) : (
          <div className="space-y-2">
            {alternatives.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">{a.brandName}</p>
                <p className="text-xs text-slate-500">
                  {a.genericName} · {a.strength}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <Badge tone={a.isAvailable ? 'green' : 'red'}>
                    {a.isAvailable ? tc('available') : tc('unavailable')}
                  </Badge>
                  {a.dosageForm && (
                    <span className="text-xs text-slate-500">{a.dosageForm}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
