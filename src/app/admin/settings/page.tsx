'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  CalendarClock,
  Package,
  RotateCcw,
  Save,
  SlidersHorizontal,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { apiError } from '@/lib/api';
import type { SystemSetting } from '@/types';

/**
 * The knobs behind the clinical rules. Triage thresholds in particular decide
 * which vitals are flagged CRITICAL, so this page is deliberately blunt about
 * what a change does rather than presenting them as harmless preferences.
 */

const CATEGORIES: {
  key: string;
  title: string;
  blurb: string;
  icon: typeof Activity;
  tone: 'red' | 'blue' | 'purple' | 'gray';
}[] = [
  {
    key: 'triage',
    title: 'Triage thresholds',
    blurb:
      'Every vital reading a health worker enters is measured against these. Loosen one and cases that would have been escalated stop being escalated.',
    icon: Activity,
    tone: 'red',
  },
  {
    key: 'inventory',
    title: 'Inventory',
    blurb: 'What counts as running low, and when the pharmacy gets told.',
    icon: Package,
    tone: 'blue',
  },
  {
    key: 'scheduling',
    title: 'Scheduling',
    blurb: 'Defaults for consultation slots and appointment reminders.',
    icon: CalendarClock,
    tone: 'purple',
  },
  {
    key: 'platform',
    title: 'Platform',
    blurb: 'Name, support contact, and the banner everyone sees.',
    icon: Building2,
    tone: 'gray',
  },
];

/** Long-form values get a textarea; the rest are single-line. */
const MULTILINE = new Set(['platform.announcement']);

/** Anything not in here is typed freely. */
const NUMERIC_PREFIXES = ['triage.', 'inventory.', 'scheduling.'];

const isNumeric = (key: string) => NUMERIC_PREFIXES.some((p) => key.startsWith(p));

/** `triage.spo2.critical` reads better as "Spo2 critical". */
function humanKey(key: string): string {
  const tail = key.split('.').slice(1).join(' ');
  return tail.charAt(0).toUpperCase() + tail.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase();
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const save = useUpdateSettings();

  const [draft, setDraft] = useState<Record<string, string>>({});

  // the server copy wins until an admin actually types something
  useEffect(() => {
    if (!settings) return;
    setDraft((prev) => {
      const next: Record<string, string> = {};
      for (const s of settings) next[s.key] = prev[s.key] ?? s.value;
      return next;
    });
  }, [settings]);

  const changed = useMemo(() => {
    if (!settings) return [] as SystemSetting[];
    return settings.filter((s) => (draft[s.key] ?? s.value) !== s.value);
  }, [settings, draft]);

  const grouped = useMemo(() => {
    const map = new Map<string, SystemSetting[]>();
    for (const s of settings ?? []) {
      map.set(s.category, [...(map.get(s.category) ?? []), s]);
    }
    // known categories first, in the order above, then anything new the backend adds
    const known = CATEGORIES.map((c) => c.key);
    const extras = [...map.keys()].filter((k) => !known.includes(k)).sort();
    return [...known, ...extras]
      .filter((k) => map.has(k))
      .map((k) => ({ category: k, items: map.get(k)! }));
  }, [settings]);

  const submit = () => {
    if (!changed.length) return;

    const bad = changed.find(
      (s) => isNumeric(s.key) && !Number.isFinite(Number(draft[s.key])),
    );
    if (bad) return toast(`${humanKey(bad.key)} has to be a number`, 'error');

    save.mutate(
      changed.map((s) => ({ key: s.key, value: draft[s.key] })),
      {
        onSuccess: () => toast(`Saved ${changed.length} change${changed.length === 1 ? '' : 's'}`),
        onError: (e) => toast(apiError(e, 'Could not save the settings'), 'error'),
      },
    );
  };

  const reset = () => {
    if (!settings) return;
    setDraft(Object.fromEntries(settings.map((s) => [s.key, s.value])));
  };

  if (isLoading) return <ListSkeleton rows={6} />;

  if (!settings?.length) {
    return (
      <Card>
        <EmptyState
          icon={SlidersHorizontal}
          title="No settings found"
          description="Defaults are seeded when the API boots. If this is empty, the settings table has not been created yet."
        />
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="System settings"
        subtitle="Clinical and operational defaults. Changes take effect immediately, everywhere."
        action={
          <>
            <Button variant="ghost" onClick={reset} disabled={!changed.length}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Discard
            </Button>
            <Button onClick={submit} loading={save.isPending} disabled={!changed.length}>
              <Save className="h-4 w-4" aria-hidden />
              {changed.length ? `Save ${changed.length}` : 'Saved'}
            </Button>
          </>
        }
      />

      {changed.some((s) => s.category === 'triage') && (
        <Alert tone="danger" title="You are changing triage thresholds" className="mb-4">
          These decide which readings are flagged critical. A doctor is paged on the strength
          of them, and existing symptom reports are not re-evaluated — only readings taken
          after you save will use the new numbers.
        </Alert>
      )}

      {changed.length > 0 && !changed.some((s) => s.category === 'triage') && (
        <Alert tone="warning" className="mb-4">
          {changed.length} unsaved change{changed.length === 1 ? '' : 's'}. Nothing is applied
          until you save.
        </Alert>
      )}

      <div className="space-y-4">
        {grouped.map(({ category, items }) => {
          const meta = CATEGORIES.find((c) => c.key === category);
          const Icon = meta?.icon ?? SlidersHorizontal;
          const dirtyHere = items.filter((s) => (draft[s.key] ?? s.value) !== s.value).length;

          return (
            <Card key={category}>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" aria-hidden />
                    {meta?.title ?? category}
                  </span>
                }
                action={
                  dirtyHere > 0 ? (
                    <Badge tone="orange" dot>
                      {dirtyHere} changed
                    </Badge>
                  ) : (
                    <Badge tone={meta?.tone ?? 'gray'}>{items.length}</Badge>
                  )
                }
              />

              {meta && <p className="-mt-1 mb-4 text-xs text-slate-500">{meta.blurb}</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((s) => {
                  const value = draft[s.key] ?? s.value;
                  const dirty = value !== s.value;
                  const set = (v: string) =>
                    setDraft((prev) => ({ ...prev, [s.key]: v }));

                  return (
                    <div
                      key={s.key}
                      className={MULTILINE.has(s.key) ? 'sm:col-span-2' : undefined}
                    >
                      {MULTILINE.has(s.key) ? (
                        <Textarea
                          label={humanKey(s.key)}
                          rows={2}
                          placeholder="Leave empty to show no banner"
                          value={value}
                          onChange={(e) => set(e.target.value)}
                        />
                      ) : (
                        <Input
                          label={humanKey(s.key)}
                          type={isNumeric(s.key) ? 'number' : 'text'}
                          step="any"
                          value={value}
                          onChange={(e) => set(e.target.value)}
                        />
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {s.description ?? s.key}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                        {s.key}
                        {dirty && (
                          <span className="ml-1.5 font-sans text-orange-600">
                            was {s.value || '(empty)'}
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4">
        <CardHeader title="What this page cannot do" />
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="text-slate-300">—</span>
            Settings can be edited but not deleted. Blank a value and the coded default is used
            instead.
          </li>
          <li className="flex gap-2">
            <span className="text-slate-300">—</span>
            New keys cannot be created here — they come from the API&apos;s own defaults on
            boot.
          </li>
          <li className="flex gap-2">
            <span className="text-slate-300">—</span>
            Nothing here is audited. The table keeps only the current value, so agree a change
            with whoever depends on it before you make it.
          </li>
        </ul>
      </Card>
    </>
  );
}
