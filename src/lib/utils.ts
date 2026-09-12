import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  INTL_DATE_LOCALE,
  INTL_TIME_LOCALE,
  defaultLocale,
  type Locale,
} from '@/i18n/config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';


export function fileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}


export function formatDate(iso?: string, locale: Locale = defaultLocale): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(INTL_DATE_LOCALE[locale], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso?: string, locale: Locale = defaultLocale): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString(INTL_TIME_LOCALE[locale], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(iso?: string, locale: Locale = defaultLocale): string {
  if (!iso) return '—';
  return `${formatDate(iso, locale)} · ${formatTime(iso, locale)}`;
}


export function dateTile(
  iso?: string,
  locale: Locale = defaultLocale,
): { day: string; month: string } {
  if (!iso) return { day: '—', month: '' };
  const date = new Date(iso);
  const intl = INTL_DATE_LOCALE[locale];
  return {
    day: date.toLocaleDateString(intl, { day: 'numeric' }),
    month: date.toLocaleDateString(intl, { month: 'short' }),
  };
}


export function timeAgo(iso?: string, locale: Locale = defaultLocale): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat(INTL_DATE_LOCALE[locale], { numeric: 'auto' });
  if (mins < 1) return rtf.format(0, 'minute');
  if (mins < 60) return rtf.format(-mins, 'minute');
  const hours = Math.floor(mins / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, 'day');
  return formatDate(iso, locale);
}

export function formatNumber(
  value?: number | null,
  locale: Locale = defaultLocale,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(INTL_DATE_LOCALE[locale]).format(value);
}

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];


export function toBengaliDigits(value?: string | number | null): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
}

export function localizeDigits(
  value?: string | number | null,
  locale: Locale = defaultLocale,
): string {
  if (value === null || value === undefined) return '';
  return locale === 'bn' ? toBengaliDigits(value) : String(value);
}

export function ageFrom(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}
