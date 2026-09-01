'use client';

import { useLocale } from 'next-intl';
import {
  dateTile,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
  localizeDigits,
  timeAgo,
} from '@/lib/utils';
import type { Locale } from '@/i18n/config';

/**
 * Binds the date and number helpers to the active locale so call sites stay as
 * short as they were before the app was bilingual - `f.date(iso)` rather than
 * `formatDate(iso, locale)` repeated on every line.
 *
 * Same shape as `useVitalTone()` in src/hooks/useTriage.ts: a hook that reads
 * one piece of context and hands back pre-bound functions.
 */
export function useFormat() {
  const locale = useLocale() as Locale;

  return {
    locale,
    isBangla: locale === 'bn',
    /** "25 Aug 2026" / "২৫ আগস্ট ২০২৬" */
    date: (iso?: string) => formatDate(iso, locale),
    /** "02:30 PM" / "০২:৩০ PM" */
    time: (iso?: string) => formatTime(iso, locale),
    dateTime: (iso?: string) => formatDateTime(iso, locale),
    /** `{ day, month }` for the calendar tile in the appointment lists. */
    tile: (iso?: string) => dateTile(iso, locale),
    /** "5 minutes ago" / "৫ মিনিট আগে" */
    relative: (iso?: string) => timeAgo(iso, locale),
    /** Counts, doses, stock. */
    num: (value?: number | null) => formatNumber(value, locale),
    /**
     * Digits embedded in a string - MRNs, "#12", "120/80". Display only; never
     * feed this back into an input or a request body.
     */
    digits: (value?: string | number | null) => localizeDigits(value, locale),
  };
}
