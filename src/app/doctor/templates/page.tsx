'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutTemplate, Pill, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useDeleteTemplate, useTemplates } from '@/hooks/useTemplates';
import { useCurrentUser } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';
import type { PrescriptionTemplate } from '@/types';

export default function DoctorTemplatesPage() {
  const { toast } = useToast();
  const me = useCurrentUser();
  const { data: templates, isLoading } = useTemplates();
  const remove = useDeleteTemplate();

  const [tab, setTab] = useState<'mine' | 'shared'>('mine');
  const [target, setTarget] = useState<PrescriptionTemplate | null>(null);

  // the list is own templates plus anything another doctor shared
  const mine = (templates ?? []).filter((t) => t.doctor?.id === me?.id);
  const shared = (templates ?? []).filter((t) => t.doctor?.id !== me?.id);
  const visible = tab === 'mine' ? mine : shared;

  const drop = () => {
    if (!target) return;
    remove.mutate(target.id, {
      onSuccess: () => {
        toast(`Deleted "${target.name}"`);
        setTarget(null);
      },
      onError: (e) => toast(apiError(e, 'Could not delete the template'), 'error'),
    });
  };

  return (
    <>
      <PageHeader
        title="Prescription templates"
        subtitle="The prescriptions you write again and again, saved once."
        action={
          <Link href="/doctor/templates/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden />
              New template
            </Button>
          </Link>
        }
      />

      <Tabs
        tabs={[
          { key: 'mine', label: 'Mine', count: mine.length },
          { key: 'shared', label: 'Shared with me', count: shared.length },
        ]}
        active={tab}
        onChange={(k) => setTab(k as typeof tab)}
        className="mb-5"
      />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !visible.length ? (
        <Card>
          <EmptyState
            icon={LayoutTemplate}
            title={tab === 'mine' ? 'No templates yet' : 'Nothing shared with you'}
            description={
              tab === 'mine'
                ? 'Save a common prescription once and apply it in two clicks afterwards.'
                : 'Templates other doctors mark as shared appear here.'
            }
            action={
              tab === 'mine' && (
                <Link href="/doctor/templates/new">
                  <Button size="sm">Create a template</Button>
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {t.condition || 'No condition set'}
                    {tab === 'shared' && t.doctor && ` · ${t.doctor.fullName}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {t.isShared && <Badge tone="purple">Shared</Badge>}
                  <Badge tone="gray">used {t.useCount}×</Badge>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {(t.items ?? []).map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-xs">
                    <Pill className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
                    <span className="text-slate-700">
                      <span className="font-medium">{item.medicine?.brandName}</span>{' '}
                      {item.medicine?.strength} — {item.dosage}, {item.frequency},{' '}
                      {item.duration}
                    </span>
                  </li>
                ))}
              </ul>

              {t.notes && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  {t.notes}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <Link href={`/doctor/prescriptions/new?templateId=${t.id}`} className="flex-1">
                  <Button size="sm" fullWidth>
                    Prescribe with this
                  </Button>
                </Link>
                {t.doctor?.id === me?.id && (
                  <Button size="sm" variant="ghost" onClick={() => setTarget(t)}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={drop}
        loading={remove.isPending}
        title="Delete this template?"
        confirmLabel="Delete template"
        description={
          <>
            &ldquo;{target?.name}&rdquo; will be gone for good. Prescriptions already written
            from it are untouched.
          </>
        }
      />
    </>
  );
}
