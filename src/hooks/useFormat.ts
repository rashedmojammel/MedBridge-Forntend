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


export function useFormat() {
  const locale = useLocale() as Locale;

  return {
    locale,
    isBangla: locale === 'bn',
    date: (iso?: string) => formatDate(iso, locale),
    time: (iso?: string) => formatTime(iso, locale),
    dateTime: (iso?: string) => formatDateTime(iso, locale),
    tile: (iso?: string) => dateTile(iso, locale),
    relative: (iso?: string) => timeAgo(iso, locale),
    num: (value?: number | null) => formatNumber(value, locale),
    
    digits: (value?: string | number | null) => localizeDigits(value, locale),
  };
}
