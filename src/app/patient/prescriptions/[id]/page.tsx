'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { usePrescription } from '@/hooks/usePrescriptions';
import { useFormat } from '@/hooks/useFormat';

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: rx, isLoading } = usePrescription(id);
  const t = useTranslations('patient');
  const tc = useTranslations('common');
  const f = useFormat();

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (!rx) return <p className="text-sm text-slate-500">{t('rxDetail.notFound')}</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {tc('back')}
      </button>

      <Card className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {t('rxNumber', { id: f.digits(rx.id) })}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {t('rxDetail.issuedBy', {
                date: f.date(rx.issuedAt),
                doctor: rx.doctor?.fullName ?? tc('dash'),
              })}
            </p>
          </div>
          <StatusBadge status={rx.status} />
        </div>

        <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
          {[
            [tc('patient'), rx.patient?.fullName],
            [tc('mrn'), f.digits(rx.patient?.mrn)],
            [tc('doctor'), rx.doctor?.fullName],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {k}
              </dt>
              <dd className="mt-0.5 text-sm text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <h2 className="mb-2 text-sm font-semibold text-slate-900">{t('rxDetail.medicines')}</h2>
      <div className="space-y-3">
        {(rx.items ?? []).map((item) => (
          <Card key={item.id}>
            <p className="text-sm font-semibold text-slate-900">
              {item.medicine?.brandName}
            </p>
            <p className="text-xs text-slate-500">
              {item.medicine?.genericName} · {item.medicine?.strength} ·{' '}
              {item.medicine?.dosageForm}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
              {[
                [t('rxDetail.dosage'), item.dosage],
                [t('rxDetail.frequency'), item.frequency],
                [t('rxDetail.duration'), item.duration],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {k}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">{v}</p>
                </div>
              ))}
            </div>
            {item.instructions && (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {item.instructions}
              </p>
            )}
          </Card>
        ))}
      </div>

      {rx.doctorNotes && (
        <Card className="mt-4 bg-slate-50">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {t('rxDetail.doctorNotes')}
          </p>
          <p className="mt-1.5 text-sm text-slate-700">{rx.doctorNotes}</p>
        </Card>
      )}

      {rx.status === 'CANCELLED' && rx.cancelReason && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
            {t('rxDetail.cancelled')}
          </p>
          <p className="mt-1.5 text-sm text-red-800">{rx.cancelReason}</p>
        </Card>
      )}
    </div>
  );
}
