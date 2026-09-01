'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProgressBar({
  value,
  max = 100,
  tone,
  className,
}: {
  value: number;
  max?: number;
  tone?: 'green' | 'orange' | 'red' | 'blue' | 'purple';
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / (max || 1)) * 100)));
  const auto: 'red' | 'orange' | 'green' = pct < 25 ? 'red' : pct < 60 ? 'orange' : 'green';
  const colour = {
    green: 'bg-green-600',
    orange: 'bg-orange-500',
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
  }[tone ?? auto];

  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-200', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn('h-full rounded-full', colour)}
      />
    </div>
  );
}
