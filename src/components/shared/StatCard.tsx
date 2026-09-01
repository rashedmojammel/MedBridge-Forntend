'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Tone = 'blue' | 'green' | 'red' | 'orange' | 'purple';

const TONES: Record<Tone, { bg: string; icon: string; value: string; ring?: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', value: 'text-green-700' },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    value: 'text-red-700',
    ring: 'border-red-200',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    value: 'text-orange-700',
    ring: 'border-orange-200',
  },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700' },
};

export default function StatCard({
  icon: Icon,
  value,
  label,
  tone = 'blue',
  hint,
  action,
  index = 0,
}: {
  icon: any;
  value: React.ReactNode;
  label: string;
  tone?: Tone;
  hint?: string;
  action?: React.ReactNode;
  index?: number;
}) {
  const t = TONES[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn(
        'rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        t.ring ?? 'border-slate-200',
      )}
    >
      <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-lg', t.bg)}>
        <Icon className={cn('h-[18px] w-[18px]', t.icon)} aria-hidden />
      </div>
      <p className={cn('text-2xl font-semibold leading-none', t.value)}>{value}</p>
      <p className="mt-1.5 text-xs font-medium text-slate-500">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </motion.div>
  );
}
