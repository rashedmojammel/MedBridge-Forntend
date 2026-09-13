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


async function resolveLocale(): Promise<Locale> {
  const jar = await cookies();

  const requested = jar.get(LOCALE_COOKIE)?.value;
  if (!isLocale(requested) || requested === defaultLocale) return defaultLocale;


  const userRaw = jar.get(USER_COOKIE)?.value;
  if (!userRaw) return requested;

  try {
    const { role } = JSON.parse(userRaw) as { role?: string };
    return role && ROLES_WITH_BANGLA.has(role as never) ? requested : defaultLocale;
  } catch {
  
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
