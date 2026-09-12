'use client';

import { useMemo, useState } from 'react';
import {
  BookHeart,
  Frown,
  Meh,
  Pill,
  Plus,
  Smile,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  useCreateDiaryEntry,
  useDeleteDiaryEntry,
  useMyDiary,
} from '@/hooks/useDiary';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { DiaryEntry, DiaryMood } from '@/types';


const MOODS: {
  value: DiaryMood;
  icon: typeof Smile;
  tone: 'green' | 'yellow' | 'red';
  ring: string;
}[] = [
  { value: 'BETTER', icon: Smile, tone: 'green', ring: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'SAME', icon: Meh, tone: 'yellow', ring: 'border-yellow-500 bg-yellow-50 text-yellow-700' },
  { value: 'WORSE', icon: Frown, tone: 'red', ring: 'border-red-500 bg-red-50 text-red-700' },
];

const moodOf = (m: DiaryMood) => MOODS.find((x) => x.value === m) ?? MOODS[1];

const COMMON_SYMPTOMS = [
  'Fever',
  'Headache',
  'Cough',
  'Tiredness',
  'Dizziness',
  'Nausea',
  'Poor sleep',
  'Shortness of breath',
  'Swelling',
  'Rash',
];

function painTone(level: number): string {
  if (level >= 7) return 'bg-red-500';
  if (level >= 4) return 'bg-orange-400';
  if (level >= 1) return 'bg-yellow-400';
  return 'bg-green-500';
}

export default function PatientDiaryPage() {
  const { toast } = useToast();
  const { data: entries, isLoading } = useMyDiary();
  const remove = useDeleteDiaryEntry();
  const t = useTranslations('patient.diary');
  const tc = useTranslations('common');
  const tm = useTranslations('enums.mood');
  const ts = useTranslations('enums.symptom');
  const f = useFormat();

  const [writing, setWriting] = useState(false);
  const [target, setTarget] = useState<DiaryEntry | null>(null);

  // the summary endpoint is for clinicians, so work the patient's own view out here
  const recent = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    return (entries ?? []).filter((e) => new Date(e.createdAt).getTime() >= cutoff);
  }, [entries]);

  const painEntries = recent.filter((e) => typeof e.painLevel === 'number');
  const averagePain = painEntries.length
    ? painEntries.reduce((sum, e) => sum + (e.painLevel ?? 0), 0) / painEntries.length
    : null;
  const takenCount = recent.filter((e) => e.medicationTaken).length;
  const adherence = recent.length ? Math.round((takenCount / recent.length) * 100) : null;

  const today = new Date().toDateString();
  const writtenToday = (entries ?? []).some(
    (e) => new Date(e.createdAt).toDateString() === today,
  );

  const drop = () => {
    if (!target) return;
    remove.mutate(target.id, {
      onSuccess: () => {
        toast(t('deleted'));
        setTarget(null);
      },
      onError: (e) => toast(apiError(e, t('deleteFailed')), 'error'),
    });
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Button onClick={() => setWriting(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            {t('write')}
          </Button>
        }
      />

      {!isLoading && !writtenToday && (entries ?? []).length > 0 && (
        <Alert tone="info" className="mb-4">
          {t('nothingToday')}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : !entries?.length ? (
            <Card>
              <EmptyState
                icon={BookHeart}
                title={t('emptyTitle')}
                description={t('emptyBody')}
                action={
                  <Button size="sm" onClick={() => setWriting(true)}>
                    {t('writeFirst')}
                  </Button>
                }
              />
            </Card>
          ) : (
            entries.map((e) => {
              const mood = moodOf(e.mood);
              const MoodIcon = mood.icon;
              return (
                <Card key={e.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full border',
                          mood.ring,
                        )}
                      >
                        <MoodIcon className="h-4 w-4" aria-hidden />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{tm(e.mood)}</p>
                        <p className="text-xs text-slate-400">
                          {f.date(e.createdAt)} · {f.relative(e.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={t('deleteAria', { date: f.date(e.createdAt) })}
                      onClick={() => setTarget(e)}
                      className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{e.note}</p>

                  {Boolean(e.symptoms?.length) && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {e.symptoms!.map((s) => (
                        <Badge key={s} tone="gray">
                          {ts.has(s) ? ts(s) : s}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs">
                    {typeof e.painLevel === 'number' && (
                      <span className="flex items-center gap-2 text-slate-500">
                        {t('pain')}
                        <span
                          className="flex gap-0.5"
                          aria-label={t('painAria', { level: f.num(e.painLevel) })}
                        >
                          {Array.from({ length: 10 }, (_, i) => (
                            <span
                              key={i}
                              className={cn(
                                'h-2 w-2 rounded-full',
                                i < e.painLevel! ? painTone(e.painLevel!) : 'bg-slate-200',
                              )}
                            />
                          ))}
                        </span>
                        <span className="font-medium text-slate-700">
                          {t('painOutOfTen', { level: f.num(e.painLevel) })}
                        </span>
                      </span>
                    )}
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        e.medicationTaken ? 'text-green-700' : 'text-orange-600',
                      )}
                    >
                      <Pill className="h-3.5 w-3.5" aria-hidden />
                      {e.medicationTaken ? t('medicineTaken') : t('medicineMissed')}
                    </span>
                    {e.recordedBy && (
                      <span className="text-slate-400">
                        {t('writtenBy', { name: e.recordedBy.fullName })}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('lastTwoWeeks')} />
            <div className="space-y-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-slate-900">{f.num(recent.length)}</p>
                <p className="text-[11px] text-slate-500">{t('entriesWritten')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-slate-900">
                  {averagePain === null
                    ? tc('dash')
                    : t('painOutOfTen', { level: f.digits(averagePain.toFixed(1)) })}
                </p>
                <p className="text-[11px] text-slate-500">{t('averagePain')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-slate-900">
                  {adherence === null ? tc('dash') : `${f.num(adherence)}%`}
                </p>
                <p className="text-[11px] text-slate-500">{t('adherenceLabel')}</p>
              </div>
            </div>

            {recent.length > 0 && (
              <div className="mt-3 flex gap-1.5">
                {MOODS.map((m) => {
                  const count = recent.filter((e) => e.mood === m.value).length;
                  if (!count) return null;
                  return (
                    <Badge key={m.value} tone={m.tone}>
                      {tm(m.value)} {f.num(count)}
                    </Badge>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title={t('whoCanSee')} />
            <ul className="space-y-2 text-sm text-slate-600">
              {(['whoCanSee1', 'whoCanSee2', 'whoCanSee3'] as const).map((key) => (
                <li key={key} className="flex gap-2">
                  <span className="text-slate-300">—</span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="flex items-start gap-1.5 text-xs text-slate-500">
              <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('honestyNote')}
            </p>
          </Card>
        </div>
      </div>

      {writing && <NewEntry onClose={() => setWriting(false)} />}

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={drop}
        loading={remove.isPending}
        danger
        title={t('deleteTitle')}
        confirmLabel={t('deleteConfirm')}
        description={t('deleteBody', { date: f.date(target?.createdAt) })}
      />
    </>
  );
}

function NewEntry({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateDiaryEntry();
  const t = useTranslations('patient.diary');
  const tc = useTranslations('common');
  const tm = useTranslations('enums.mood');
  const ts = useTranslations('enums.symptom');
  const f = useFormat();

  const [note, setNote] = useState('');
  const [mood, setMood] = useState<DiaryMood>('SAME');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [painLevel, setPainLevel] = useState(0);
  const [medicationTaken, setMedicationTaken] = useState(true);

  const toggle = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    if (!symptoms.includes(value)) setSymptoms((prev) => [...prev, value]);
    setCustom('');
  };

  const submit = () => {
    if (note.trim().length < 3) return toast(t('noteRequired'), 'error');

    create.mutate(
      {
        note: note.trim(),
        mood,
        medicationTaken,
        painLevel,
        ...(symptoms.length ? { symptoms } : {}),
      },
      {
        onSuccess: () => {
          toast(t('saved'));
          onClose();
        },
        onError: (e) => toast(apiError(e, t('saveFailed')), 'error'),
      },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('modalTitle')}
      width="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            {t('saveEntry')}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-700">
            {t('comparedYesterday')} <span className="text-red-600">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const active = mood === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMood(m.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors',
                    active
                      ? m.ring
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {tm(m.value)}
                </button>
              );
            })}
          </div>
        </div>

        <Textarea
          label={t('ownWords')}
          required
          rows={3}
          placeholder={t('ownWordsPlaceholder')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div>
          <p className="mb-2 text-xs font-medium text-slate-700">{t('troubling')}</p>
          <div className="flex flex-wrap gap-1.5">
            {[...COMMON_SYMPTOMS, ...symptoms.filter((s) => !COMMON_SYMPTOMS.includes(s))].map(
              (s) => {
                const active = symptoms.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(s)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {ts.has(s) ? ts(s) : s}
                  </button>
                );
              },
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder={t('customPlaceholder')}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
            />
            <Button variant="outline" onClick={addCustom}>
              {tc('add')}
            </Button>
          </div>
        </div>

        <div>
          <label
            htmlFor="pain"
            className="mb-2 block text-xs font-medium text-slate-700"
          >
            {painLevel === 0
              ? t('painNowNone')
              : t('painNow', { level: f.num(painLevel) })}
          </label>
          <input
            id="pain"
            type="range"
            min={0}
            max={10}
            step={1}
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{t('noPain')}</span>
            <span>{t('worstPain')}</span>
          </div>
        </div>

        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
            checked={medicationTaken}
            onChange={(e) => setMedicationTaken(e.target.checked)}
          />
          <span className="text-sm">
            <span className="font-medium text-slate-800">{t('tookMedicine')}</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {t('tookMedicineHint')}
            </span>
          </span>
        </label>

        {mood === 'WORSE' && painLevel >= 7 && (
          <Alert tone="danger" className="rounded-lg">
            {t('worseDanger')}
          </Alert>
        )}
      </div>
    </Modal>
  );
}
