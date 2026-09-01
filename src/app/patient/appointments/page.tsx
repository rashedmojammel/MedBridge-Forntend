'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useAppointments } from '@/hooks/useAppointments';
import { useFormat } from '@/hooks/useFormat';

export default function PatientAppointmentsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data: appointments, isLoading } = useAppointments(tab);
  const t = useTranslations('patient.appointments');
  const tc = useTranslations('common');
  const tt = useTranslations('enums.appointmentType');
  const f = useFormat();

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Tabs
        tabs={[
          { key: 'upcoming', label: tc('upcoming') },
          { key: 'past', label: tc('past') },
        ]}
        active={tab}
        onChange={(k) => setTab(k as any)}
        className="mb-5"
      />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !appointments?.length ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title={tab === 'upcoming' ? t('emptyUpcoming') : t('emptyPast')}
            description={t('emptyBody')}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const tile = f.tile(a.scheduledAt);
            return (
              <Card key={a.id}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="rounded-lg bg-purple-50 px-4 py-2.5 text-center">
                    <p className="text-lg font-semibold leading-none text-purple-700">
                      {tile.day}
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-purple-600">
                      {tile.month}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {a.doctor?.fullName}
                    </p>
                    <p className="text-xs text-slate-500">{f.dateTime(a.scheduledAt)}</p>
                    {a.type && (
                      <Badge tone="purple" className="mt-1.5">
                        {tt.has(a.type) ? tt(a.type) : a.type.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
