'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Clock, PackageCheck, Pill, TriangleAlert } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useDispensingQueue } from '@/hooks/useDispensing';
import { formatDate, timeAgo } from '@/lib/utils';
import type { Prescription, PrescriptionItem } from '@/types';


const STALE_DAYS = 3;

function daysWaiting(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function shortfall(item: PrescriptionItem): 'out' | 'low' | 'ok' {
  const inv = item.medicine?.inventory;
  if (!inv) return 'out';
  if (inv.stockQty <= 0) return 'out';
  if (inv.stockQty < inv.threshold) return 'low';
  return 'ok';
}

export default function DispensingQueuePage() {
  const { data: queue, isLoading } = useDispensingQueue();
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();
  const visible = (queue ?? []).filter((rx) =>
    !term
      ? true
      : [rx.patient?.fullName, rx.patient?.mrn, rx.doctor?.fullName, String(rx.id)]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(term)),
  );

  const counts = useMemo(() => {
    const rows = queue ?? [];
    return {
      total: rows.length,
      partial: rows.filter((rx) => rx.dispenseStatus === 'PARTIAL').length,
      stale: rows.filter((rx) => daysWaiting(rx.issuedAt) >= STALE_DAYS).length,
      blocked: rows.filter((rx) =>
        (rx.items ?? []).some((i) => shortfall(i) === 'out'),
      ).length,
    };
  }, [queue]);

  return (
    <>
      <PageHeader
        title="Dispensing queue"
        subtitle="Prescriptions waiting at the counter. Handing medicine over here is what moves stock."
      />

      {counts.blocked > 0 && (
        <Alert tone="warning" title="Some prescriptions cannot be filled" className="mb-4">
          {counts.blocked === 1
            ? 'One prescription in this queue includes a medicine you have none of.'
            : `${counts.blocked} prescriptions include a medicine you have none of.`}{' '}
          Dispense what you have — the rest stays outstanding — and check the alternatives on
          the medicine page.
        </Alert>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-2xl font-semibold text-slate-900">{counts.total}</p>
          <p className="text-xs text-slate-500">waiting</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-blue-700">{counts.partial}</p>
          <p className="text-xs text-slate-500">part-dispensed</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-orange-600">{counts.stale}</p>
          <p className="text-xs text-slate-500">waiting {STALE_DAYS}+ days</p>
        </Card>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by patient, MRN, doctor, or prescription number..."
        />
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !visible.length ? (
        <Card>
          <EmptyState
            icon={term ? ClipboardList : PackageCheck}
            title={term ? 'No matches' : 'Nothing waiting'}
            description={
              term
                ? 'Try a different name or prescription number.'
                : 'Every active prescription has been dispensed. New ones appear here the moment a doctor issues them.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((rx) => (
            <QueueRow key={rx.id} rx={rx} />
          ))}
        </div>
      )}

      {(queue ?? []).length >= 100 && (
        <p className="mt-4 text-xs text-slate-400">
          Showing the 100 oldest prescriptions. Clear some to see the rest.
        </p>
      )}
    </>
  );
}

function QueueRow({ rx }: { rx: Prescription }) {
  const waiting = daysWaiting(rx.issuedAt);
  const items = rx.items ?? [];
  const out = items.filter((i) => shortfall(i) === 'out');

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={rx.patient?.fullName} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {rx.patient?.fullName ?? 'Unknown patient'}
            </p>
            <p className="truncate font-mono text-xs text-slate-500">{rx.patient?.mrn}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              Prescription #{rx.id} · {rx.doctor?.fullName ?? 'Unknown doctor'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {waiting >= STALE_DAYS && (
            <Badge tone="orange" dot>
              {waiting} days
            </Badge>
          )}
          <StatusBadge status={rx.dispenseStatus} />
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {items.map((item) => {
          const state = shortfall(item);
          const stock = item.medicine?.inventory?.stockQty;
          return (
            <li key={item.id} className="flex items-start gap-2 text-xs">
              <Pill
                className={
                  state === 'out'
                    ? 'mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500'
                    : state === 'low'
                      ? 'mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500'
                      : 'mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600'
                }
                aria-hidden
              />
              <span className="min-w-0 flex-1 text-slate-700">
                <span className="font-medium">{item.medicine?.brandName}</span>{' '}
                {item.medicine?.strength} — {item.dosage}, {item.frequency}, {item.duration}
              </span>
              <span
                className={
                  state === 'out'
                    ? 'shrink-0 font-medium text-red-600'
                    : state === 'low'
                      ? 'shrink-0 font-medium text-orange-600'
                      : 'shrink-0 text-slate-400'
                }
              >
                {stock === undefined ? 'no stock record' : `${stock} in stock`}
              </span>
            </li>
          );
        })}
      </ul>

      {rx.doctorNotes && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {rx.doctorNotes}
        </p>
      )}

      {out.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-red-600">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {out.length === 1
            ? `${out[0].medicine?.brandName} is out of stock.`
            : `${out.length} of these medicines are out of stock.`}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <p className="mr-auto flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Issued {formatDate(rx.issuedAt)} · {timeAgo(rx.issuedAt)}
        </p>
        <Link href={`/pharmacist/dispensing/${rx.id}`}>
          <Button size="sm">
            <PackageCheck className="h-3.5 w-3.5" aria-hidden />
            {rx.dispenseStatus === 'PARTIAL' ? 'Finish dispensing' : 'Dispense'}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
