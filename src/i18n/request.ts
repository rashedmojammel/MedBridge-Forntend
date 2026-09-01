import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import {
  LOCALE_COOKIE,
  ROLES_WITH_BANGLA,
  USER_COOKIE,
  defaultLocale,
  isLocale,
  type Locale,
} from './config';

/**
 * Resolves the language for one request.
 *
 * Two cookies decide it. `medbridge_lang` is what the reader asked for;
 * `medbridge_user` is the session, and it has the final say - only PATIENT and
 * CHW have Bangla copy, so every other role is pinned to English even if the
 * language cookie was set to `bn` while browsing the public site before logging
 * in. Without that pin, a doctor logging in after a Bangla visit would get
 * translated shared components wrapped around untranslated doctor pages.
 *
 * Reading cookies here opts the app into dynamic rendering. That is the
 * accepted cost of keeping the locale out of the URL.
 */
async function resolveLocale(): Promise<Locale> {
  const jar = await cookies();

  const requested = jar.get(LOCALE_COOKIE)?.value;
  if (!isLocale(requested) || requested === defaultLocale) return defaultLocale;

  // No session means public or auth pages, where anyone may read Bangla.
  const userRaw = jar.get(USER_COOKIE)?.value;
  if (!userRaw) return requested;

  try {
    const { role } = JSON.parse(userRaw) as { role?: string };
    return role && ROLES_WITH_BANGLA.has(role as never) ? requested : defaultLocale;
  } catch {
    // Same defensive parse as src/middleware.ts - a corrupt cookie must not
    // decide a language, so fall back rather than throw the whole render.
    return defaultLocale;
  }
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
