'use client';

import { useFormat } from '@/hooks/useFormat';
import { cn } from '@/lib/utils';

export default function VitalChip({
  label,
  value,
  unit,
  tone = 'normal',
}: {
  label: string;
  value?: number | string | null;
  unit?: string;
  tone?: 'normal' | 'warning' | 'critical';
}) {
  // localised here rather than at every call site - a reading is a reading
  const f = useFormat();
  const colour = {
    normal: 'text-green-700',
    warning: 'text-orange-600',
    critical: 'text-red-600',
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
      <p className={cn('text-base font-semibold leading-tight', colour)}>
        {value != null ? f.digits(String(value)) : '—'}
        {value != null && unit && (
          <span className="ml-0.5 text-[10px] font-medium">{unit}</span>
        )}
      </p>
      <p className="mt-0.5 text-[10px] font-medium text-slate-500">{label}</p>
    </div>
  );
}
