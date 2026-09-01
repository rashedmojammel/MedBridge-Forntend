'use client';

import { useEffect, useState } from 'react';
import { CalendarOff, Clock, Plus, Save, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  useAddTimeOff,
  useMyAvailability,
  useRemoveTimeOff,
  useSetAvailability,
  type SlotPayload,
} from '@/hooks/useAvailability';
import { apiError } from '@/lib/api';
import { formatDate } from '@/lib/utils';

/** dayOfWeek follows the JS convention the backend uses: 0 = Sunday. */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SLOT_LENGTHS = [15, 20, 30, 45, 60];

const MAX_SLOTS = 40;

interface Draft extends SlotPayload {
  slotMinutes: number;
  isActive: boolean;
}

const blank = (dayOfWeek: number): Draft => ({
  dayOfWeek,
  startTime: '09:00',
  endTime: '13:00',
  slotMinutes: 30,
  isActive: true,
});

export default function DoctorAvailabilityPage() {
  const { toast } = useToast();
  const { data, isLoading } = useMyAvailability();
  const save = useSetAvailability();
  const addTimeOff = useAddTimeOff();
  const removeTimeOff = useRemoveTimeOff();

  const [slots, setSlots] = useState<Draft[]>([]);
  const [dirty, setDirty] = useState(false);

  const [offOpen, setOffOpen] = useState(false);
  const [offDate, setOffDate] = useState('');
  const [offReason, setOffReason] = useState('');

  // the server copy is the source of truth until the doctor edits something
  useEffect(() => {
    if (!data || dirty) return;
    setSlots(
      data.slots.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime.slice(0, 5),
        endTime: s.endTime.slice(0, 5),
        slotMinutes: s.slotMinutes,
        isActive: s.isActive,
      })),
    );
  }, [data, dirty]);

  const edit = (index: number, patch: Partial<Draft>) => {
    setDirty(true);
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addBlock = (dayOfWeek: number) => {
    if (slots.length >= MAX_SLOTS) {
      return toast(`You can keep at most ${MAX_SLOTS} blocks`, 'error');
    }
    setDirty(true);
    setSlots((prev) => [...prev, blank(dayOfWeek)]);
  };

  const removeBlock = (index: number) => {
    setDirty(true);
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = () => {
    const broken = slots.find((s) => s.endTime <= s.startTime);
    if (broken) {
      return toast(
        `${DAYS[broken.dayOfWeek]}: the end time has to be after the start time`,
        'error',
      );
    }

    // PUT replaces the whole pattern, so everything currently on screen is sent
    save.mutate(slots, {
      onSuccess: () => {
        toast('Consulting hours saved');
        setDirty(false);
      },
      onError: (e) => toast(apiError(e, 'Could not save your hours'), 'error'),
    });
  };

  const submitTimeOff = () => {
    if (!offDate) return toast('Pick a date', 'error');
    addTimeOff.mutate(
      { date: offDate, ...(offReason.trim() ? { reason: offReason.trim() } : {}) },
      {
        onSuccess: () => {
          toast('Time off added');
          setOffOpen(false);
          setOffDate('');
          setOffReason('');
        },
        onError: (e) => toast(apiError(e, 'Could not add the time off'), 'error'),
      },
    );
  };

  const dropTimeOff = (id: number) => {
    removeTimeOff.mutate(id, {
      onSuccess: () => toast('Time off removed'),
      onError: (e) => toast(apiError(e, 'Could not remove it'), 'error'),
    });
  };

  if (isLoading) return <ListSkeleton rows={6} />;

  const timeOff = data?.timeOff ?? [];
  const weeklyMinutes = slots
    .filter((s) => s.isActive)
    .reduce((total, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      return total + Math.max(0, eh * 60 + em - (sh * 60 + sm));
    }, 0);

  return (
    <>
      <PageHeader
        title="Consulting hours"
        subtitle="What a health worker can book you into. Nothing outside these blocks is offered."
        action={
          <Button onClick={submit} loading={save.isPending} disabled={!dirty}>
            <Save className="h-4 w-4" aria-hidden />
            {dirty ? 'Save changes' : 'Saved'}
          </Button>
        }
      />

      {dirty && (
        <Alert tone="warning" className="mb-4">
          Unsaved changes. Saving replaces your whole weekly pattern with what is on this
          screen.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {DAYS.map((day, dayIndex) => {
            const forDay = slots
              .map((slot, index) => ({ slot, index }))
              .filter(({ slot }) => slot.dayOfWeek === dayIndex);

            return (
              <Card key={day}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{day}</p>
                    {!forDay.length && <Badge tone="gray">Not consulting</Badge>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => addBlock(dayIndex)}>
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Add block
                  </Button>
                </div>

                {!forDay.length ? (
                  <p className="rounded-lg border border-dashed border-slate-200 py-4 text-center text-xs text-slate-400">
                    No hours set for this day.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {forDay.map(({ slot, index }) => (
                      <li
                        key={index}
                        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-3"
                      >
                        <Input
                          label="From"
                          type="time"
                          className="w-28"
                          value={slot.startTime}
                          onChange={(e) => edit(index, { startTime: e.target.value })}
                        />
                        <Input
                          label="To"
                          type="time"
                          className="w-28"
                          value={slot.endTime}
                          onChange={(e) => edit(index, { endTime: e.target.value })}
                        />
                        <Select
                          label="Slot length"
                          className="w-32"
                          value={String(slot.slotMinutes)}
                          onChange={(e) =>
                            edit(index, { slotMinutes: Number(e.target.value) })
                          }
                        >
                          {SLOT_LENGTHS.map((m) => (
                            <option key={m} value={m}>
                              {m} min
                            </option>
                          ))}
                        </Select>
                        <label className="flex items-center gap-2 pb-2.5 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300"
                            checked={slot.isActive}
                            onChange={(e) => edit(index, { isActive: e.target.checked })}
                          />
                          Active
                        </label>
                        <button
                          type="button"
                          aria-label="Remove this block"
                          onClick={() => removeBlock(index)}
                          className="mb-2 rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="This week at a glance" />
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-slate-900">
                  {Math.floor(weeklyMinutes / 60)}h {weeklyMinutes % 60}m
                </p>
                <p className="text-[11px] text-slate-500">bookable each week</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-semibold text-slate-900">
                  {slots.filter((s) => s.isActive).length}
                </p>
                <p className="text-[11px] text-slate-500">
                  active blocks of {MAX_SLOTS} allowed
                </p>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Booked consultations are removed from the offered times automatically, so a
              slot is never handed out twice.
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Time off"
              action={
                <Button size="sm" variant="outline" onClick={() => setOffOpen(true)}>
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add
                </Button>
              }
            />
            {!timeOff.length ? (
              <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                No days blocked out.
              </p>
            ) : (
              <ul className="space-y-2">
                {timeOff.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <CalendarOff className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {formatDate(t.date)}
                      </p>
                      {t.reason && (
                        <p className="truncate text-xs text-slate-500">{t.reason}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove time off on ${t.date}`}
                      onClick={() => dropTimeOff(t.id)}
                      className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-500">
              A day off overrides the weekly pattern completely — nothing is offered on it.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={offOpen}
        onClose={() => setOffOpen(false)}
        title="Block out a day"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOffOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitTimeOff} loading={addTimeOff.isPending}>
              Add time off
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            required
            value={offDate}
            onChange={(e) => setOffDate(e.target.value)}
          />
          <Input
            label="Reason"
            placeholder="Training day"
            value={offReason}
            onChange={(e) => setOffReason(e.target.value)}
          />
          <Alert tone="info" className="rounded-lg">
            Consultations already booked on that day are not cancelled — check your schedule
            and move them yourself.
          </Alert>
        </div>
      </Modal>
    </>
  );
}
