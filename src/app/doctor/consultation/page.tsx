'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Stethoscope, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useConsultations } from '@/hooks/useConsultations';
import { formatDateTime, cn } from '@/lib/utils';

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function DoctorConsultationsPage() {
  const [tab, setTab] = useState('ALL');
  const { data: consultations, isLoading } = useConsultations();

  const list = consultations ?? [];
  const filtered = list.filter((c) => tab === 'ALL' || c.status === tab);

  // a consultation the doctor has talked through but never wrote up
  const needsDiagnosis = list.filter(
    (c) => c.status !== 'CANCELLED' && c.status !== 'COMPLETED' && !c.diagnosis,
  ).length;

  const tabs = TABS.map((t) => ({
    ...t,
    count:
      t.key === 'ALL'
        ? list.length
        : list.filter((c) => c.status === t.key).length,
  }));

  return (
    <>
      <PageHeader
        title="Consultations"
        subtitle="Every case assigned to you, newest first."
      />

      {needsDiagnosis > 0 && (
        <Card className="mb-5 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-orange-600" aria-hidden />
            <p className="text-sm text-orange-900">
              <span className="font-semibold">{needsDiagnosis}</span>{' '}
              {needsDiagnosis === 1 ? 'consultation has' : 'consultations have'} no
              diagnosis recorded yet.
            </p>
          </div>
        </Card>
      )}

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-5" />

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : !filtered.length ? (
        <Card>
          <EmptyState
            icon={MessageSquare}
            title="Nothing here"
            description={
              tab === 'ALL'
                ? 'Consultations appear once a health worker books one with you.'
                : 'No consultations with this status.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Card
                padded={false}
                className={cn(
                  'overflow-hidden border-l-4',
                  c.status === 'IN_PROGRESS' && 'border-l-blue-500',
                  c.status === 'SCHEDULED' && 'border-l-orange-400',
                  c.status === 'COMPLETED' && 'border-l-slate-300',
                  c.status === 'CANCELLED' && 'border-l-red-400',
                )}
              >
                <div className="flex flex-wrap items-start gap-3 p-4">
                  <Avatar name={c.patient?.fullName} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {c.patient?.fullName}
                      </p>
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                        {c.patient?.mrn}
                      </code>
                      <StatusBadge status={c.status} />
                      {!c.diagnosis && c.status !== 'CANCELLED' && (
                        <Badge tone="orange">Needs diagnosis</Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{c.reason}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(c.scheduledAt)}
                      {c.scheduledBy && ` · booked by ${c.scheduledBy.fullName}`}
                    </p>
                    {c.diagnosis && (
                      <p className="mt-2 line-clamp-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Diagnosis:</span>{' '}
                        {c.diagnosis}
                      </p>
                    )}
                  </div>
                  <Link href={`/doctor/consultation/${c.id}`} className="shrink-0">
                    <Button size="sm" variant={c.status === 'COMPLETED' ? 'outline' : 'primary'}>
                      <Stethoscope className="h-3.5 w-3.5" aria-hidden />
                      {c.status === 'COMPLETED' ? 'Review' : 'Open'}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
