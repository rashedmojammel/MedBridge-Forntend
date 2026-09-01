'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import { setLocale } from '@/i18n/locale';
import { LOCALE_SHORT, locales, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Switches the reading language.
 *
 * The choice is written to a cookie by a server action, then `router.refresh()`
 * re-renders from the server - which is what updates `<html lang>` in the root
 * layout as well as the copy, since both are resolved there.
 *
 * Only rendered where Bangla actually exists (public pages, and the PATIENT and
 * CHW shells). Showing it to a doctor would offer a switch that does nothing:
 * src/i18n/request.ts pins those roles to English.
 */
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
            // Each label is in its own language, so a reader who cannot read the
            // current one can still find the way out.
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
