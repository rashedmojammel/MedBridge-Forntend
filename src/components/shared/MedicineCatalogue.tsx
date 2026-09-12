'use client';

import { useState } from 'react';
import { Pill, PackageCheck, Plus, Search, SlidersHorizontal, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import SearchBar from '@/components/shared/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  useLowStock,
  useMedicineSearch,
  useUpdateMedicine,
  useUpdateStock,
} from '@/hooks/useMedicines';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';
import type { Medicine, StockAction } from '@/types';

export const DOSAGE_FORMS = ['TABLET', 'SYRUP', 'INJECTION', 'DROPS'];
const STOCK_REASONS = [
  { value: 'Restock delivery', key: 'restock' },
  { value: 'Expired', key: 'expired' },
  { value: 'Damaged', key: 'damaged' },
  { value: 'Stock correction', key: 'correction' },
] as const;

export default function MedicineCatalogue({
  canAdjustStock = false,
  onAdd,
}: {
  canAdjustStock?: boolean;
  onAdd?: () => void;
}) {
  const { toast } = useToast();
  const t = useTranslations('medicines');
  const tc = useTranslations('common');
  const tf = useTranslations('enums.dosageForm');
  const ta = useTranslations('enums.stockAction');
  const f = useFormat();

  const [query, setQuery] = useState('');
  const debounced = useDebounce(query);
  const searching = debounced.trim().length >= 2;

  const { data: results, isLoading: searchLoading } = useMedicineSearch(debounced);
  const { data: lowStock, isLoading: lowLoading } = useLowStock();

  const updateMedicine = useUpdateMedicine();
  const updateStock = useUpdateStock();

  const [editing, setEditing] = useState<Medicine | null>(null);
  const [form, setForm] = useState({
    brandName: '',
    genericName: '',
    manufacturer: '',
    dosageForm: DOSAGE_FORMS[0],
    strength: '',
    therapeuticClass: '',
    isAvailable: true,
  });

  const [stocking, setStocking] = useState<Medicine | null>(null);
  const [action, setAction] = useState<StockAction>('ADD');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<string>(STOCK_REASONS[0].value);
  const rows: Medicine[] = searching
    ? (results ?? [])
    : (lowStock ?? [])
        .filter((inv) => inv.medicine)
        .map((inv) => ({ ...inv.medicine!, inventory: inv }));

  const isLoading = searching ? searchLoading : lowLoading;

  const openEdit = (m: Medicine) => {
    setForm({
      brandName: m.brandName,
      genericName: m.genericName,
      manufacturer: m.manufacturer ?? '',
      dosageForm: m.dosageForm,
      strength: m.strength,
      therapeuticClass: m.therapeuticClass ?? '',
      isAvailable: m.isAvailable,
    });
    setEditing(m);
  };

  const submitEdit = () => {
    if (!editing) return;
    if (!form.brandName.trim() || !form.genericName.trim() || !form.strength.trim()) {
      return toast(t('vRequired'), 'error');
    }
    updateMedicine.mutate(
      {
        id: editing.id,
        payload: {
          brandName: form.brandName.trim(),
          genericName: form.genericName.trim(),
          dosageForm: form.dosageForm,
          strength: form.strength.trim(),
          isAvailable: form.isAvailable,
          ...(form.manufacturer.trim() ? { manufacturer: form.manufacturer.trim() } : {}),
          ...(form.therapeuticClass.trim()
            ? { therapeuticClass: form.therapeuticClass.trim() }
            : {}),
        },
      },
      {
        onSuccess: () => {
          toast(t('updated'));
          setEditing(null);
        },
        onError: (e) => toast(apiError(e, t('updateFailed')), 'error'),
      },
    );
  };

  const stockPreview = (() => {
    const inv = stocking?.inventory;
    if (!inv) return 0;
    if (!quantity) return inv.stockQty;
    const q = Number(quantity);
    if (action === 'ADD') return inv.stockQty + q;
    if (action === 'REDUCE') return Math.max(0, inv.stockQty - q);
    return q;
  })();

  const submitStock = () => {
    if (!stocking) return;
    if (!quantity || Number(quantity) < 1) return toast(t('vQuantity'), 'error');
    updateStock.mutate(
      { id: stocking.id, action, quantity: Number(quantity), reason },
      {
        onSuccess: () => {
          toast(t('stockUpdated'));
          setStocking(null);
          setQuantity('');
        },
        onError: (e) => toast(apiError(e, t('stockFailed')), 'error'),
      },
    );
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-64 flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t('searchPlaceholder')}
          />
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            {t('addMedicine')}
          </Button>
        )}
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
        {searching ? (
          <>
            <Search className="h-3.5 w-3.5" aria-hidden />
            {t('resultsFor', { term: debounced.trim() })}
          </>
        ) : (
          <>
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            {t('lowStockHint')}
          </>
        )}
      </div>

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : !rows.length ? (
          <EmptyState
            icon={searching ? Pill : PackageCheck}
            title={searching ? t('nothingMatched') : t('allHealthy')}
            description={searching ? t('nothingMatchedBody') : t('allHealthyBody')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  {[
                    t('thMedicine'),
                    t('thGeneric'),
                    t('thForm'),
                    t('thStock'),
                    t('thStatus'),
                    tc('actions'),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const inv = m.inventory;
                  const low = inv ? inv.stockQty < inv.threshold : false;
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{m.brandName}</p>
                        {m.manufacturer && (
                          <p className="text-xs text-slate-400">{m.manufacturer}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {m.genericName}
                        {m.therapeuticClass && (
                          <span className="block text-xs text-slate-400">
                            {m.therapeuticClass}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {tf.has(m.dosageForm) ? tf(m.dosageForm) : m.dosageForm} ·{' '}
                        {f.digits(m.strength)}
                      </td>
                      <td className="w-36 px-4 py-3">
                        {inv ? (
                          <>
                            <span
                              className={
                                inv.stockQty === 0
                                  ? 'text-sm font-semibold text-red-600'
                                  : low
                                    ? 'text-sm font-semibold text-orange-600'
                                    : 'text-sm font-semibold text-slate-700'
                              }
                            >
                              {f.num(inv.stockQty)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {' '}
                              / {f.num(inv.threshold)}
                            </span>
                            <ProgressBar
                              value={inv.stockQty}
                              max={Math.max(inv.threshold, inv.stockQty)}
                              tone={inv.stockQty === 0 ? 'red' : low ? 'orange' : 'green'}
                            />
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">{tc('dash')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {m.isAvailable ? (
                          <Badge tone={low ? 'orange' : 'green'}>
                            {inv?.stockQty === 0
                              ? t('outOfStock')
                              : low
                                ? t('low')
                                : tc('available')}
                          </Badge>
                        ) : (
                          <Badge tone="gray">{t('retired')}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {canAdjustStock && inv && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setStocking(m);
                                setQuantity('');
                                setAction('ADD');
                              }}
                            >
                              {t('stockBtn')}
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            {tc('edit')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={t('editTitle', { name: editing?.brandName ?? t('editFallback') })}
        width="max-w-lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              {tc('cancel')}
            </Button>
            <Button onClick={submitEdit} loading={updateMedicine.isPending}>
              {tc('saveChanges')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('brandName')}
              required
              value={form.brandName}
              onChange={(e) => setForm((prev) => ({ ...prev, brandName: e.target.value }))}
            />
            <Input
              label={t('genericName')}
              required
              value={form.genericName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, genericName: e.target.value }))
              }
            />
            <Select
              label={t('dosageForm')}
              required
              value={form.dosageForm}
              onChange={(e) => setForm((prev) => ({ ...prev, dosageForm: e.target.value }))}
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
              onChange={(e) => setForm((prev) => ({ ...prev, strength: e.target.value }))}
            />
            <Input
              label={t('manufacturer')}
              value={form.manufacturer}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, manufacturer: e.target.value }))
              }
            />
            <Input
              label={t('therapeuticClass')}
              placeholder={t('classPlaceholder')}
              value={form.therapeuticClass}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, therapeuticClass: e.target.value }))
              }
            />
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
              checked={form.isAvailable}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))
              }
            />
            <span className="text-sm">
              <span className="font-medium text-slate-800">
                {t('availableToPrescribe')}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {t('retireHint')}
              </span>
            </span>
          </label>

          <p className="text-xs text-slate-400">{t('stockNotEditable')}</p>
        </div>
      </Modal>

      <Modal
        open={stocking !== null}
        onClose={() => setStocking(null)}
        title={t('stockTitle', { name: stocking?.brandName ?? '' })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStocking(null)}>
              {tc('cancel')}
            </Button>
            <Button onClick={submitStock} loading={updateStock.isPending}>
              {t('updateStock')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-xs text-slate-500">{t('currentStock')}</p>
            <p className="text-lg font-semibold text-slate-900">
              {/* raw count - ICU picks the plural form and localises the digit */}
              {t('units', { count: stocking?.inventory?.stockQty ?? 0 })}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-700">{t('action')}</p>
            <div className="grid grid-cols-3 gap-2">
              {(['ADD', 'REDUCE', 'SET'] as StockAction[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={
                    action === a
                      ? 'rounded-lg border-2 border-blue-500 bg-blue-50 py-2 text-xs font-medium text-blue-700'
                      : 'rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:border-slate-300'
                  }
                >
                  {ta.has(a) ? ta(a) : a}
                </button>
              ))}
            </div>
          </div>

          <Input
            label={t('quantity')}
            type="number"
            min={1}
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Select
            label={tc('reason')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {STOCK_REASONS.map((r) => (
              <option key={r.key} value={r.value}>
                {t(`reasons.${r.key}`)}
              </option>
            ))}
          </Select>

          {stockPreview < (stocking?.inventory?.threshold ?? 0) ? (
            <Alert tone="warning" className="rounded-lg">
              {t('belowThreshold', {
                level: t('units', { count: stockPreview }),
                threshold: f.num(stocking?.inventory?.threshold ?? 0),
              })}
            </Alert>
          ) : (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-800">
              {t('newLevelLabel')}:{' '}
              <span className="font-semibold">{t('units', { count: stockPreview })}</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
