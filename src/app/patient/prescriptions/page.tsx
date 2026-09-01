'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Pill, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useFormat } from '@/hooks/useFormat';
import { cn } from '@/lib/utils';

const TAB_KEYS = ['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;

export default function PatientPrescriptionsPage() {
  const [tab, setTab] = useState<string>('ALL');
  const { data: prescriptions, isLoading } = usePrescriptions();
  const t = useTranslations('patient');
  const tc = useTranslations('common');
  const ts = useTranslations('enums.status');
  const f = useFormat();

  const filtered = (prescriptions ?? []).filter(
    (r) => tab === 'ALL' || r.status === tab,
  );

  return (
    <>
      <PageHeader title={t('prescriptions.title')} subtitle={t('prescriptions.subtitle')} />

      <Tabs
        tabs={TAB_KEYS.map((key) => ({
          key,
          label: key === 'ALL' ? tc('all') : ts(key),
        }))}
        active={tab}
        onChange={setTab}
        className="mb-5"
      />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !filtered.length ? (
        <Card>
          <EmptyState
            icon={Pill}
            title={t('prescriptions.emptyTitle')}
            description={t('prescriptions.emptyBody')}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <Card
                padded={false}
                className={cn(
                  'overflow-hidden border-l-4',
                  rx.status === 'ACTIVE' && 'border-l-green-500',
                  rx.status === 'CANCELLED' && 'border-l-red-500',
                  rx.status === 'COMPLETED' && 'border-l-slate-300',
                )}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-slate-400" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {t('rxNumber', { id: f.digits(rx.id) })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rx.doctor?.fullName} · {f.date(rx.issuedAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={rx.status} />
                </div>

                <div className="px-4 py-3">
                  <ul className="space-y-1.5">
                    {(rx.items ?? []).slice(0, 3).map((item) => (
                      <li key={item.id} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-800">
                          {item.medicine?.brandName}
                        </span>{' '}
                        — {item.dosage}, {item.frequency}, {item.duration}
                      </li>
                    ))}
                    {(rx.items?.length ?? 0) > 3 && (
                      <li className="text-xs text-slate-400">
                        {tc('more', { count: f.digits(rx.items.length - 3) })}
                      </li>
                    )}
                  </ul>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/patient/prescriptions/${rx.id}`}>
                      <Button size="sm" variant="outline">
                        {tc('viewDetails')}
                      </Button>
                    </Link>
                    <Link href="/patient/medicines">
                      <Button size="sm" variant="ghost">
                        {t('prescriptions.findAlternatives')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
