'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useConsultations } from '@/hooks/useConsultations';
import { useFormat } from '@/hooks/useFormat';

export default function PatientConsultationsPage() {
  const { data: consultations, isLoading } = useConsultations();
  const t = useTranslations('patient.consultations');
  const tc = useTranslations('common');
  const f = useFormat();

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !consultations?.length ? (
        <Card>
          <EmptyState
            icon={MessageSquare}
            title={t('emptyTitle')}
            description={t('emptyBody')}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => (
            <Link key={c.id} href={`/patient/consultation/${c.id}`}>
              <Card className="transition-colors hover:border-blue-300">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {c.doctor?.fullName ?? tc('doctor')}
                    </p>
                    <p className="text-xs text-slate-500">{f.dateTime(c.scheduledAt)}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {c.diagnosis || c.reason}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
