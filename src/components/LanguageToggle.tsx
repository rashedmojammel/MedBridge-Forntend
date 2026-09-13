'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import { setLocale } from '@/i18n/locale';
import { LOCALE_SHORT, locales, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

export default function LanguageToggle({ className }: { className?: string }) {
  const active = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === active || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5',
        pending && 'opacity-60',
        className,
      )}
    >
      <Languages className="ml-1 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
      {locales.map((code) => {
        const on = code === active;
        return (
          <button
            key={code}
            type="button"
            onClick={() => choose(code)}
            aria-pressed={on}
            lang={code}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-semibold transition-colors',
              on
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {LOCALE_SHORT[code]}
          </button>
        );
      })}
    </div>
  );
}
