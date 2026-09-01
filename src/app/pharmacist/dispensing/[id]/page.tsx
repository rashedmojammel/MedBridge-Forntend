'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  Pill,
  TriangleAlert,
  User as UserIcon,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useDispense, useDispenseHistory, useDispensingQueue } from '@/hooks/useDispensing';
import { apiError } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Prescription, PrescriptionItem } from '@/types';

/**
 * One prescription at the counter. A pharmacist cannot read
 * GET /prescriptions/:id at all, so everything here comes from the dispense
 * endpoint plus whatever the queue already told us about the patient.
 */

export default function DispensePrescriptionPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: history, isLoading } = useDispenseHistory(id);
  const { data: queue } = useDispensingQueue();
  const dispense = useDispense();

  // the header details only exist in the queue payload, and the prescription
  // drops out of the queue the moment it is fully dispensed - so hold on to it
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  useEffect(() => {
    const found = (queue ?? []).find((rx) => String(rx.id) === String(id));
    if (found) setPrescription(found);
  }, [queue, id]);

  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState('');

  const outstanding = history?.outstanding ?? [];
  const chosen = outstanding.filter((item) => {
    const raw = quantities[item.medicine.id];
    return raw !== undefined && raw.trim() !== '' && Number(raw) > 0;
  });

  const problems = useMemo(
    () =>
      chosen
        .map((item) => {
          const want = Number(quantities[item.medicine.id]);
          const have = item.medicine.inventory?.stockQty;
          if (have === undefined) {
            return `${item.medicine.brandName} has no inventory record — dispensing it will fail.`;
          }
          if (want > have) {
            return `${item.medicine.brandName}: you have ${have}, entering ${want}.`;
          }
          return null;
        })
        .filter(Boolean) as string[],
    [chosen, quantities],
  );

  const submit = () => {
    if (!chosen.length) return toast('Enter a quantity for at least one medicine', 'error');

    const items = chosen.map((item) => ({
      medicineId: item.medicine.id,
      quantity: Number(quantities[item.medicine.id]),
    }));
    if (items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1)) {
      return toast('Quantities have to be whole numbers of 1 or more', 'error');
    }

    dispense.mutate(
      { id: Number(id), items, ...(notes.trim() ? { notes: notes.trim() } : {}) },
      {
        onSuccess: (result) => {
          toast(
            result.dispenseStatus === 'DISPENSED'
              ? 'Prescription fully dispensed'
              : 'Recorded — some medicines still outstanding',
          );
          setQuantities({});
          setNotes('');
        },
        onError: (e) => toast(apiError(e, 'Could not record the dispensing'), 'error'),
      },
    );
  };

  if (isLoading) return <ListSkeleton rows={5} />;

  if (!history) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardList}
          title="Prescription not found"
          description="It may have been cancelled, or the number is wrong."
          action={
            <Link href="/pharmacist/dispensing">
              <Button size="sm">Back to the queue</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const done = history.dispenseStatus === 'DISPENSED';

  return (
    <>
      <Link
        href="/pharmacist/dispensing"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dispensing queue
      </Link>

      <PageHeader
        title={`Prescription #${history.prescriptionId}`}
        subtitle={
          done
            ? 'Everything on this prescription has been handed over.'
            : 'Enter what you are handing over. Stock moves the moment you record it.'
        }
        action={<StatusBadge status={history.dispenseStatus} />}
      />

      {done && (
        <Alert tone="success" title="Fully dispensed" className="mb-4">
          Closed {formatDateTime(history.dispensedAt ?? undefined)}. Nothing further is owed to
          the patient on this prescription.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title={`Still to hand over${outstanding.length ? ` (${outstanding.length})` : ''}`}
            />
            {!outstanding.length ? (
              <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                Nothing outstanding.
              </p>
            ) : (
              <ul className="space-y-2">
                {outstanding.map((item) => (
                  <OutstandingRow
                    key={item.id}
                    item={item}
                    value={quantities[item.medicine.id] ?? ''}
                    onChange={(v) =>
                      setQuantities((prev) => ({ ...prev, [item.medicine.id]: v }))
                    }
                  />
                ))}
              </ul>
            )}
          </Card>

          {outstanding.length > 0 && (
            <Card>
              <CardHeader title="Counter note" />
              <Textarea
                rows={2}
                placeholder="Gave the patient the generic — brand was out. Explained the twice-daily schedule."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Attached to every medicine recorded in this hand-over, and visible to the
                prescribing doctor.
              </p>
            </Card>
          )}

          <Card>
            <CardHeader
              title={`Already dispensed${history.records.length ? ` (${history.records.length})` : ''}`}
            />
            {!history.records.length ? (
              <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                Nothing has left the shelf against this prescription yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {history.records.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-start gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {r.medicine?.brandName}{' '}
                        <span className="font-normal text-slate-500">
                          {r.medicine?.strength}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.quantity} handed over · {formatDateTime(r.dispensedAt)}
                        {r.dispensedBy && ` · ${r.dispensedBy.fullName}`}
                      </p>
                      {r.notes && (
                        <p className="mt-1 text-xs italic text-slate-500">{r.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          {prescription ? (
            <Card>
              <CardHeader title="Patient" />
              <div className="flex items-center gap-3">
                <Avatar name={prescription.patient?.fullName} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {prescription.patient?.fullName}
                  </p>
                  <p className="truncate font-mono text-xs text-slate-500">
                    {prescription.patient?.mrn}
                  </p>
                </div>
              </div>
              <dl className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Prescribed by</dt>
                  <dd className="text-right font-medium text-slate-800">
                    {prescription.doctor?.fullName ?? '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Issued</dt>
                  <dd className="text-right font-medium text-slate-800">
                    {formatDate(prescription.issuedAt)}
                  </dd>
                </div>
                {prescription.patient?.phone && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {prescription.patient.phone}
                    </dd>
                  </div>
                )}
              </dl>
              {prescription.patient?.allergies && (
                <Alert tone="danger" title="Allergies" className="mt-3 rounded-lg">
                  {prescription.patient.allergies}
                </Alert>
              )}
              {prescription.doctorNotes && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  {prescription.doctorNotes}
                </p>
              )}
            </Card>
          ) : (
            <Card>
              <CardHeader title="Patient" />
              <p className="flex items-start gap-1.5 text-xs text-slate-500">
                <UserIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Patient details are only carried on the counter queue, and this prescription
                has already left it. Look the person up by name if you need their record.
              </p>
            </Card>
          )}

          {problems.length > 0 && (
            <Alert tone="warning" title="Check these before recording">
              <ul className="space-y-1">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Alert>
          )}

          {outstanding.length > 0 && (
            <>
              <Card>
                <Button
                  fullWidth
                  onClick={submit}
                  loading={dispense.isPending}
                  disabled={!chosen.length}
                >
                  <PackageCheck className="h-4 w-4" aria-hidden />
                  {chosen.length
                    ? `Record ${chosen.length} ${chosen.length === 1 ? 'medicine' : 'medicines'}`
                    : 'Record hand-over'}
                </Button>
                <p className="mt-2 text-center text-xs text-slate-500">
                  {chosen.length === outstanding.length
                    ? 'This closes the prescription.'
                    : 'The rest stays outstanding for next time.'}
                </p>
              </Card>

              <Card>
                <CardHeader title="How this is recorded" />
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-slate-300">—</span>
                    Stock is decremented and the record written in one step — there is no undo.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-300">—</span>
                    A medicine counts as done once anything is recorded against it, even a
                    part course. Enter the full quantity you are actually handing over.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-300">—</span>
                    The patient is notified, and dropping below threshold alerts the pharmacy
                    and admins.
                  </li>
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function OutstandingRow({
  item,
  value,
  onChange,
}: {
  item: PrescriptionItem;
  value: string;
  onChange: (value: string) => void;
}) {
  const stock = item.medicine.inventory?.stockQty;
  const threshold = item.medicine.inventory?.threshold;
  const outOfStock = stock !== undefined && stock <= 0;

  return (
    <li className="rounded-lg border border-slate-200 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Pill
            className={
              outOfStock
                ? 'mt-0.5 h-4 w-4 shrink-0 text-red-500'
                : 'mt-0.5 h-4 w-4 shrink-0 text-blue-600'
            }
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">
              {item.medicine.brandName}{' '}
              <span className="font-normal text-slate-500">{item.medicine.strength}</span>
            </p>
            <p className="text-xs text-slate-500">
              {item.medicine.genericName} · {item.medicine.dosageForm}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {item.dosage} · {item.frequency} · {item.duration} · {item.route}
            </p>
            {item.instructions && (
              <p className="mt-0.5 text-xs italic text-slate-400">{item.instructions}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-end gap-3">
          <div className="text-right">
            {stock === undefined ? (
              <Badge tone="red">No stock record</Badge>
            ) : (
              <Badge tone={outOfStock ? 'red' : stock < (threshold ?? 0) ? 'orange' : 'gray'}>
                {stock} in stock
              </Badge>
            )}
          </div>
          <Input
            type="number"
            min={1}
            className="w-24"
            aria-label={`Quantity of ${item.medicine.brandName} to hand over`}
            placeholder="Qty"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>

      {outOfStock && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          None on the shelf. Leave this blank and it stays outstanding.
        </p>
      )}
    </li>
  );
}
