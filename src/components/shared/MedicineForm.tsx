'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, Plus, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import MedicinePicker from '@/components/shared/MedicinePicker';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useCreateMedicine } from '@/hooks/useMedicines';
import { DOSAGE_FORMS } from '@/components/shared/MedicineCatalogue';
import { apiError } from '@/lib/api';
import type { Medicine } from '@/types';

export default function MedicineForm({ backHref }: { backHref: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const create = useCreateMedicine();
  const t = useTranslations('medicines');
  const tc = useTranslations('common');
  const tf = useTranslations('enums.dosageForm');

  const [form, setForm] = useState({
    brandName: '',
    genericName: '',
    manufacturer: '',
    dosageForm: DOSAGE_FORMS[0],
    strength: '',
    therapeuticClass: '',
    isAvailable: true,
    stockQty: '0',
    threshold: '10',
  });
  const [alternatives, setAlternatives] = useState<Medicine[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brandName.trim() || !form.genericName.trim() || !form.strength.trim()) {
      return toast(t('vRequired'), 'error');
    }

    create.mutate(
      {
        brandName: form.brandName.trim(),
        genericName: form.genericName.trim(),
        dosageForm: form.dosageForm,
        strength: form.strength.trim(),
        isAvailable: form.isAvailable,
        stockQty: Number(form.stockQty) || 0,
        threshold: Number(form.threshold) || 0,
        ...(form.manufacturer.trim() ? { manufacturer: form.manufacturer.trim() } : {}),
        ...(form.therapeuticClass.trim()
          ? { therapeuticClass: form.therapeuticClass.trim() }
          : {}),
        ...(alternatives.length
          ? { alternativeIds: alternatives.map((m) => m.id) }
          : {}),
      },
      {
        onSuccess: (medicine) => {
          toast(t('created', { name: medicine.brandName }));
          router.push(backHref);
        },
        onError: (err) => toast(apiError(err, t('createFailed')), 'error'),
      },
    );
  };

  
  return (
    <form onSubmit={submit}>
      <PageHeader title={t('addTitle')} subtitle={t('addSubtitle')} />


      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title={t('identity')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('brandName')}
                required
                placeholder={t('brandPlaceholder')}
                value={form.brandName}
                onChange={(e) => set('brandName', e.target.value)}
              />
              <Input
                label={t('genericName')}
                required
                placeholder={t('genericPlaceholder')}
                value={form.genericName}
                onChange={(e) => set('genericName', e.target.value)}
              />
              <Select
                label={t('dosageForm')}
                required
                value={form.dosageForm}
                onChange={(e) => set('dosageForm', e.target.value)}
              >

                {DOSAGE_FORMS.map((d) => (
                  <option key={d} value={d}>
                    {tf.has(d) ? tf(d) : d}
                  </option>
                ))}
              </Select>
              <Input
                label={t('strength')}
                required
                placeholder={t('strengthPlaceholder')}
                value={form.strength}
                onChange={(e) => set('strength', e.target.value)}
              />
              <Input
                label={t('manufacturer')}
                placeholder={t('manufacturerPlaceholder')}
                value={form.manufacturer}
                onChange={(e) => set('manufacturer', e.target.value)}
              />
              <Input
                label={t('therapeuticClass')}
                placeholder={t('classPlaceholder')}
                value={form.therapeuticClass}
                onChange={(e) => set('therapeuticClass', e.target.value)}
              />
            </div>
          </Card>


          <Card>
            <CardHeader title={t('openingInventory')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('stockQty')}
                type="number"
                min={0}
                value={form.stockQty}
                onChange={(e) => set('stockQty', e.target.value)}
              />
              <Input
                label={t('threshold')}
                type="number"
                min={0}
                hint={t('thresholdHint')}
                value={form.threshold}
                onChange={(e) => set('threshold', e.target.value)}
              />
            </div>
            <Alert tone="info" className="mt-4 rounded-lg">
              {t('thresholdNote')}
            </Alert>
          </Card>


          <Card>
            <CardHeader
              title={t('alternatives')}
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPickerOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  {t('addAlternative')}
                </Button>
              }
            />
            <p className="mb-3 text-xs text-slate-500">{t('alternativesHint')}</p>
            {!alternatives.length ? (
              <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                {t('noneLinked')}
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {alternatives.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1.5 text-sm"
                  >
                    <Pill className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    <span className="text-slate-700">{m.brandName}</span>
                    <button
                      type="button"
                      aria-label={t('removeAlt', { name: m.brandName })}
                      onClick={() =>
                        setAlternatives((prev) => prev.filter((a) => a.id !== m.id))
                      }
                      className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>


        <div className="space-y-4">
          <Card>
            <CardHeader title={t('availability')} />
            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                checked={form.isAvailable}
                onChange={(e) => set('isAvailable', e.target.checked)}
              />
              <span className="text-sm">
                <span className="font-medium text-slate-800">
                  {t('availableToPrescribe')}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {t('availableHint')}
                </span>
              </span>
            </label>
          </Card>


          <Card>
            <Button type="submit" fullWidth loading={create.isPending}>
              <Save className="h-4 w-4" aria-hidden />
              {t('addToCatalogue')}
            </Button>
            <Button
              type="button"
              fullWidth
              variant="ghost"
              className="mt-2"
              onClick={() => router.push(backHref)}
            >
              {tc('cancel')}
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={t('linkAlternative')}
        width="max-w-lg"
      >
        <MedicinePicker
          onSelect={(m) => {
            setAlternatives((prev) =>
              prev.some((a) => a.id === m.id) ? prev : [...prev, m],
            );
            setPickerOpen(false);
          }}
        />
      </Modal>
    </form>
  );
}
