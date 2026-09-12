'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export default function SearchBar({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const t = useTranslations('common');
  return (
    <div
      className={cn(
        'flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3',
        'transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100',
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('searchPlaceholder')}
        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label={t('clearSearch')}
          className="text-slate-400 transition-colors hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
