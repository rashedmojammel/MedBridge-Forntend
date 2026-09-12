'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, LayoutTemplate, Pill, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import MedicinePicker from '@/components/shared/MedicinePicker';
import PatientPicker from '@/components/shared/PatientPicker';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useCreatePrescription } from '@/hooks/usePrescriptions';
import { useApplyTemplate, useTemplates } from '@/hooks/useTemplates';
import { usePatient } from '@/hooks/usePatients';
import { apiError } from '@/lib/api';
import { FREQUENCIES, ROUTES } from '@/lib/prescribing';
import type { Medicine, Patient } from '@/types';

interface DraftItem {
  medicine: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

const BLANK = {
  dosage: '',
  frequency: FREQUENCIES[1],
  duration: '',
  route: ROUTES[0],
  instructions: '',
};

function NewPrescriptionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useSearchParams();

  const patientIdParam = params.get('patientId');
  const consultationIdParam = params.get('consultationId');

  const { data: prefilled } = usePatient(patientIdParam ?? undefined);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [notes, setNotes] = useState('');

  const [adding, setAdding] = useState(false);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [draft, setDraft] = useState({ ...BLANK });
  const [templateOpen, setTemplateOpen] = useState(false);

  const create = useCreatePrescription();
  const { data: templates } = useTemplates();
  const applyTemplate = useApplyTemplate();

  useEffect(() => {
    if (prefilled && !patient) setPatient(prefilled);
  }, [prefilled, patient]);

  const addItem = () => {
    if (!medicine) return toast('Choose a medicine', 'error');
    if (!draft.dosage.trim()) return toast('Enter a dosage', 'error');
    if (!draft.duration.trim()) return toast('Enter a duration', 'error');
    if (items.some((it) => it.medicine.id === medicine.id)) {
      return toast('That medicine is already on this prescription', 'error');
    }
    setItems((prev) => [...prev, { medicine, ...draft }]);
    setMedicine(null);
    setDraft({ ...BLANK });
    setAdding(false);
  };

  const pickTemplate = (id: number) => {
    applyTemplate.mutate(id, {
      onSuccess: (applied) => {
        setItems((prev) => {
          const existing = new Set(prev.map((it) => it.medicine.id));
          const incoming = applied.items
            .filter((it) => !existing.has(it.medicineId))
            .map((it) => ({
              medicine: it.medicine,
              dosage: it.dosage,
              frequency: it.frequency,
              duration: it.duration,
              route: it.route || ROUTES[0],
              instructions: it.instructions ?? '',
            }));
          return [...prev, ...incoming];
        });
        if (applied.notes && !notes) setNotes(applied.notes);
        setTemplateOpen(false);
        toast(`Applied "${applied.name}"`);
      },
      onError: (e) => toast(apiError(e, 'Could not apply template'), 'error'),
    });
  };

  const appliedFromUrl = useRef(false);
  const templateIdParam = params.get('templateId');
  useEffect(() => {
    if (!templateIdParam || appliedFromUrl.current) return;
    appliedFromUrl.current = true;
    pickTemplate(Number(templateIdParam));
    
  }, [templateIdParam]);

  const submit = () => {
    if (!patient) return toast('Choose a patient', 'error');
    if (!items.length) return toast('Add at least one medicine', 'error');
    create.mutate(
      {
        patientId: patient.id,
        ...(consultationIdParam ? { consultationId: Number(consultationIdParam) } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        items: items.map((it) => ({
          medicineId: it.medicine.id,
          dosage: it.dosage.trim(),
          frequency: it.frequency,
          duration: it.duration.trim(),
          route: it.route,
          ...(it.instructions.trim() ? { instructions: it.instructions.trim() } : {}),
        })),
      },
      {
        onSuccess: () => {
          toast('Prescription issued');
          router.push('/doctor/prescriptions');
        },
        onError: (e) => toast(apiError(e, 'Could not issue prescription'), 'error'),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="New prescription"
        subtitle="Check the dose before you issue — a prescription cannot be edited afterwards."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Patient" />
            <PatientPicker
              selected={patient}
              onSelect={setPatient}
              onClear={() => setPatient(null)}
            />
          </Card>

          <Card>
            <CardHeader
              title={`Medicines${items.length ? ` (${items.length})` : ''}`}
              action={
                <div className="flex gap-1.5">
                  {Boolean(templates?.length) && (
                    <Button size="sm" variant="ghost" onClick={() => setTemplateOpen(true)}>
                      <LayoutTemplate className="h-3.5 w-3.5" aria-hidden />
                      Use template
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Add medicine
                  </Button>
                </div>
              }
            />

            {!items.length ? (
              <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                No medicines yet. Add at least one to issue this prescription.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((it, idx) => (
                  <li
                    key={it.medicine.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <Pill className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {it.medicine.brandName}{' '}
                        <span className="font-normal text-slate-500">
                          {it.medicine.strength}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">{it.medicine.genericName}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {it.dosage} · {it.frequency} · {it.duration} · {it.route}
                      </p>
                      {it.instructions && (
                        <p className="mt-0.5 text-xs italic text-slate-400">
                          {it.instructions}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${it.medicine.brandName}`}
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Notes for the patient and pharmacy" />
            <Textarea
              rows={3}
              placeholder="Take after food. Return in one week if the fever persists."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Before you issue" />
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Issued prescriptions are immutable. A mistake has to be cancelled with a
                reason, which the patient sees.
              </li>
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Stock levels shown while searching are live, so avoid prescribing
                something the pharmacy has none of.
              </li>
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                The patient is notified as soon as you issue.
              </li>
            </ul>
          </Card>

          {patient?.allergies && (
            <Alert tone="danger" title="Recorded allergies">
              {patient.allergies}
            </Alert>
          )}
          {patient?.currentMedications && (
            <Alert tone="warning" title="Already taking">
              {patient.currentMedications}
            </Alert>
          )}

          <Card>
            <Button
              fullWidth
              onClick={submit}
              loading={create.isPending}
              disabled={!patient || !items.length}
            >
              <FileText className="h-4 w-4" aria-hidden />
              Issue prescription
            </Button>
            <Button
              fullWidth
              variant="ghost"
              className="mt-2"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a medicine"
        width="max-w-lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={addItem}>Add to prescription</Button>
          </>
        }
      >
        <div className="space-y-4">
          <MedicinePicker
            selected={medicine}
            onSelect={setMedicine}
            onClear={() => setMedicine(null)}
          />

          {medicine?.inventory && medicine.inventory.stockQty === 0 && (
            <Alert tone="warning" className="rounded-lg">
              The pharmacy has none of this in stock right now.
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Dosage"
              required
              placeholder="1 tablet"
              value={draft.dosage}
              onChange={(e) => setDraft((d) => ({ ...d, dosage: e.target.value }))}
            />
            <Select
              label="Frequency"
              required
              value={draft.frequency}
              onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value }))}
            >
              {FREQUENCIES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
            <Input
              label="Duration"
              required
              placeholder="5 days"
              value={draft.duration}
              onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
            />
            <Select
              label="Route"
              value={draft.route}
              onChange={(e) => setDraft((d) => ({ ...d, route: e.target.value }))}
            >
              {ROUTES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Instructions"
            rows={2}
            placeholder="After food, with a full glass of water"
            value={draft.instructions}
            onChange={(e) => setDraft((d) => ({ ...d, instructions: e.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title="Apply a template"
        width="max-w-lg"
      >
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Items already on this prescription are left alone.
          </p>
          {(templates ?? []).map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={applyTemplate.isPending}
              onClick={() => pickTemplate(t.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-blue-300 hover:bg-slate-50 disabled:opacity-60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{t.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {t.condition ?? 'No condition set'} · {t.items?.length ?? 0} medicines
                </p>
              </div>
              {t.isShared && <Badge tone="purple">Shared</Badge>}
              <Badge tone="gray">used {t.useCount}×</Badge>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

export default function NewPrescriptionPage() {
  // reading ?patientId / ?consultationId needs a suspense boundary to prerender
  return (
    <Suspense fallback={null}>
      <NewPrescriptionForm />
    </Suspense>
  );
}
