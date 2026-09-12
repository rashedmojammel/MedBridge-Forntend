import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { localizeDigits } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

const COPYRIGHT_YEAR = 2026;

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('publicNav');
  const locale = useLocale() as Locale;

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
            <Image
              src="/medbridge-icon.png"
              alt="Medbridge"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            Medbridge
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{t('tagline')}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t('platform')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/how-it-works" className="hover:text-blue-600">{nav('howItWorks')}</Link></li>
            <li><Link href="/doctors" className="hover:text-blue-600">{t('findDoctor')}</Link></li>
            <li><Link href="/chws" className="hover:text-blue-600">{nav('chws')}</Link></li>
            <li><Link href="/register" className="hover:text-blue-600">{t('registerAsPatient')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t('forProviders')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/contact" className="hover:text-blue-600">{t('joinAsDoctor')}</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600">{t('joinAsChw')}</Link></li>
            <li><Link href="/login" className="hover:text-blue-600">{t('providerLogin')}</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600">{t('support')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t('contact')}</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {t('location')}
            </li>
            {/* Address and number stay literal: they are dialled and typed, not read. */}
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              hello@medbridge.com.bd
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              +880 1700-000000
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row">
          {}
          <p>{t('copyright', { year: localizeDigits(COPYRIGHT_YEAR, locale) })}</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-600">{t('privacy')}</Link>
            <Link href="#" className="hover:text-slate-600">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}