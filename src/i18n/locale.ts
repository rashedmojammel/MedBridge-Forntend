'use server';

import { cookies } from 'next/headers';
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from './config';

/**
 * Stores the reader's language choice.
 *
 * Deliberately longer-lived and laxer than the session cookies in
 * `src/lib/auth.ts` (`expires: 1`, `sameSite: 'strict'`): being able to read the
 * site should outlast any single login, and a language preference is not a
 * credential.
 */
export async function setLocale(locale: Locale): Promise<void> {
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, isLocale(locale) ? locale : defaultLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
