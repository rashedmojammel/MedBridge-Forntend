'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutTemplate, Pill, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import MedicinePicker from '@/components/shared/MedicinePicker';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useCreateTemplate } from '@/hooks/useTemplates';
import { apiError } from '@/lib/api';
import { FREQUENCIES, ROUTES } from '@/lib/prescribing';
import type { Medicine } from '@/types';

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

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const create = useCreateTemplate();

  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [items, setItems] = useState<DraftItem[]>([]);

  const [adding, setAdding] = useState(false);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [draft, setDraft] = useState({ ...BLANK });

  const addItem = () => {
    if (!medicine) return toast('Choose a medicine', 'error');
    if (!draft.dosage.trim()) return toast('Enter a dosage', 'error');
    if (!draft.duration.trim()) return toast('Enter a duration', 'error');
    if (items.some((it) => it.medicine.id === medicine.id)) {
      return toast('That medicine is already in this template', 'error');
    }
    setItems((prev) => [...prev, { medicine, ...draft }]);
    setMedicine(null);
    setDraft({ ...BLANK });
    setAdding(false);
  };

  const submit = () => {
    if (!name.trim()) return toast('Give the template a name', 'error');
    if (!items.length) return toast('Add at least one medicine', 'error');

    // built field by field - the API rejects unknown properties
    create.mutate(
      {
        name: name.trim(),
        isShared,
        ...(condition.trim() ? { condition: condition.trim() } : {}),
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
          toast('Template saved');
          router.push('/doctor/templates');
        },
        onError: (e) => toast(apiError(e, 'Could not save the template'), 'error'),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="New template"
        subtitle="A reusable set of medicines. Nothing is prescribed until you apply it to a patient."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="What is it for" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                required
                placeholder="Uncomplicated malaria — adult"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Condition"
                placeholder="Malaria"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={`Medicines${items.length ? ` (${items.length})` : ''}`}
              action={
                <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add medicine
                </Button>
              }
            />
            {!items.length ? (
              <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                A template needs at least one medicine.
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
            <CardHeader title="Default notes" />
            <Textarea
              rows={3}
              placeholder="Complete the full course even if the fever settles."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="mt-2 text-xs text-slate-500">
              Copied into the prescription when you apply the template, unless you have
              already written notes of your own.
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Sharing" />
            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
              />
              <span className="text-sm">
                <span className="font-medium text-slate-800">Share with other doctors</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  They can apply it but not change or delete it. Useful for agreed protocols.
                </span>
              </span>
            </label>
          </Card>

          <Card>
            <CardHeader title="How templates behave" />
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Applying one fills the prescription form; you still check the dose and issue
                it yourself.
              </li>
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Medicines already on the prescription are left alone, never duplicated.
              </li>
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Popular templates sort to the top of the list.
              </li>
            </ul>
          </Card>

          <Card>
            <Button
              fullWidth
              onClick={submit}
              loading={create.isPending}
              disabled={!name.trim() || !items.length}
            >
              <LayoutTemplate className="h-4 w-4" aria-hidden />
              Save template
            </Button>
            <Button
              fullWidth
              variant="ghost"
              className="mt-2"
              onClick={() => router.push('/doctor/templates')}
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
            <Button onClick={addItem}>Add to template</Button>
          </>
        }
      >
        <div className="space-y-4">
          <MedicinePicker
            selected={medicine}
            onSelect={setMedicine}
            onClear={() => setMedicine(null)}
          />

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
    </>
  );
}
