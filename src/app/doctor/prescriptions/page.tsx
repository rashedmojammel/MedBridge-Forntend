'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Pill, Plus, XCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useCancelPrescription, usePrescriptions } from '@/hooks/usePrescriptions';
import { apiError } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import type { DispenseStatus, Prescription } from '@/types';

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const DISPENSE_TONE: Record<DispenseStatus, 'gray' | 'orange' | 'green'> = {
  PENDING: 'gray',
  PARTIAL: 'orange',
  DISPENSED: 'green',
};

const DISPENSE_LABEL: Record<DispenseStatus, string> = {
  PENDING: 'Not collected',
  PARTIAL: 'Partly collected',
  DISPENSED: 'Collected',
};

export default function DoctorPrescriptionsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState('ALL');
  const [cancelling, setCancelling] = useState<Prescription | null>(null);
  const [reason, setReason] = useState('');

  const { data: prescriptions, isLoading } = usePrescriptions();
  const cancel = useCancelPrescription();

  const list = prescriptions ?? [];
  const filtered = list.filter((rx) => tab === 'ALL' || rx.status === tab);
  const tabs = TABS.map((t) => ({
    ...t,
    count: t.key === 'ALL' ? list.length : list.filter((rx) => rx.status === t.key).length,
  }));

  const submitCancel = () => {
    if (!cancelling) return;
    if (reason.trim().length < 4) return toast('Give a reason for the cancellation', 'error');
    cancel.mutate(
      { id: cancelling.id, reason: reason.trim() },
      {
        onSuccess: () => {
          toast('Prescription cancelled');
          setCancelling(null);
          setReason('');
        },
        onError: (e) => toast(apiError(e, 'Could not cancel'), 'error'),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="Prescriptions"
        subtitle="Everything you have issued. Issued prescriptions cannot be edited."
        action={
          <Link href="/doctor/prescriptions/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden />
              New prescription
            </Button>
          </Link>
        }
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-5" />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !filtered.length ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No prescriptions here"
            description={
              tab === 'ALL'
                ? 'Issue one from a consultation or straight from a patient chart.'
                : 'Nothing with this status.'
            }
            action={
              tab === 'ALL' && (
                <Link href="/doctor/prescriptions/new">
                  <Button size="sm">New prescription</Button>
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
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
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {rx.patient?.fullName}{' '}
                      <span className="font-normal text-slate-400">· #{rx.id}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5">
                        {rx.patient?.mrn}
                      </code>{' '}
                      · issued {formatDate(rx.issuedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      tone={
                        rx.status === 'ACTIVE'
                          ? 'green'
                          : rx.status === 'CANCELLED'
                            ? 'red'
                            : 'gray'
                      }
                    >
                      {rx.status}
                    </Badge>
                    {rx.status === 'ACTIVE' && (
                      <Badge tone={DISPENSE_TONE[rx.dispenseStatus] ?? 'gray'}>
                        {DISPENSE_LABEL[rx.dispenseStatus] ?? rx.dispenseStatus}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3">
                  <ul className="space-y-1.5">
                    {(rx.items ?? []).map((item) => (
                      <li key={item.id} className="flex gap-2 text-sm text-slate-600">
                        <Pill className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span>
                          <span className="font-medium text-slate-800">
                            {item.medicine?.brandName}
                          </span>{' '}
                          {item.medicine?.strength} — {item.dosage}, {item.frequency},{' '}
                          {item.duration}
                          {item.instructions && (
                            <span className="text-slate-400"> · {item.instructions}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {rx.doctorNotes && (
                    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {rx.doctorNotes}
                    </p>
                  )}

                  {rx.status === 'CANCELLED' && rx.cancelReason && (
                    <Alert tone="danger" className="mt-3 rounded-lg">
                      Cancelled{rx.cancelledAt ? ` ${formatDate(rx.cancelledAt)}` : ''}:{' '}
                      {rx.cancelReason}
                    </Alert>
                  )}

                  {rx.status === 'ACTIVE' && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setCancelling(rx);
                          setReason('');
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5" aria-hidden />
                        Cancel prescription
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={cancelling !== null}
        onClose={() => setCancelling(null)}
        title={`Cancel prescription #${cancelling?.id ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelling(null)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={submitCancel} loading={cancel.isPending}>
              Cancel prescription
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert tone="warning" title="This stays on the record">
            The prescription is not deleted — it is marked cancelled with your reason,
            visible to the patient and the pharmacy.
          </Alert>
          <Textarea
            label="Reason"
            required
            rows={3}
            placeholder="Wrong dose, patient reported an allergy, superseded by a new prescription..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
