import type { UserRole } from '@/types';

/**
 * Locale plumbing shared by the server config, the toggle, and the formatters.
 *
 * The locale lives in a cookie rather than the URL. That is a deliberate
 * constraint: `src/middleware.ts` matches every guard with
 * `pathname.startsWith(prefix)` against ROLE_ROUTES and PUBLIC_PATHS, so a
 * `/bn` path segment would silently defeat all five role guards.
 */

export const locales = ['en', 'bn'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const LOCALE_COOKIE = 'medbridge_lang';

/** The session cookie, read here only to decide which language a role may see. */
export const USER_COOKIE = 'medbridge_user';

/**
 * Bangla exists for the people the product is actually for - villagers and the
 * health workers who visit them. Doctors, pharmacists and admins work in
 * English, and their screens carry drug names, dosages and audit records.
 *
 * Gating by role on the server (rather than inside each component) is what lets
 * the shared components - PatientRecord, ReferralsBoard, the chat, the whole of
 * ui/ - be translated exactly once. A doctor session resolves to English no
 * matter what the cookie says, so it cannot render half-translated screens.
 */
export const ROLES_WITH_BANGLA: ReadonlySet<UserRole> = new Set<UserRole>([
  'PATIENT',
  'CHW',
]);

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Human label for the toggle, in the language it switches to. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
};

/** Short label for the compact pill. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  bn: 'বাং',
};

/**
 * BCP-47 tags for Intl. `bn-BD` gives Bengali month names and Bengali digits
 * without any extra work.
 *
 * Dates and times are split because the English formatting predates this and is
 * kept exactly as it was: en-GB for dates (day-first), en-US for times (12-hour
 * with AM/PM). Merging them would quietly reformat every screen in the four
 * roles that stay English.
 */
export const INTL_DATE_LOCALE: Record<Locale, string> = {
  en: 'en-GB',
  bn: 'bn-BD',
};

export const INTL_TIME_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  bn: 'bn-BD',
};
