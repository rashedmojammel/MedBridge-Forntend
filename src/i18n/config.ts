import type { UserRole } from '@/types';



export const locales = ['en', 'bn'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const LOCALE_COOKIE = 'medbridge_lang';


export const USER_COOKIE = 'medbridge_user';


export const ROLES_WITH_BANGLA: ReadonlySet<UserRole> = new Set<UserRole>([
  'PATIENT',
  'CHW',
]);

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}


export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
};

/** Short label for the compact pill. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  bn: 'বাং',
};


export const INTL_DATE_LOCALE: Record<Locale, string> = {
  en: 'en-GB',
  bn: 'bn-BD',
};

export const INTL_TIME_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  bn: 'bn-BD',
};
