import Link from 'next/link';
import {
  UserPlus,
  Stethoscope,
  Activity,
  MessageSquare,
  Pill,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
  Wifi,
  Languages,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { localizeDigits } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

// `metadata` cannot be a static object any more: the title has to follow the
// reader's language, and that is only known per request.
export async function generateMetadata() {
  const t = await getTranslations('howItWorks');
  return { title: t('metaTitle'), description: t('metaDescription') };
}

// Icons and order live here; the words live in messages/*.json.
const STEPS = [
  { icon: UserPlus, key: 'register' },
  { icon: Activity, key: 'vitals' },
  { icon: Stethoscope, key: 'critical' },
  { icon: MessageSquare, key: 'consultation' },
  { icon: Pill, key: 'prescription' },
  { icon: PackageCheck, key: 'dispensing' },
] as const;

const PRINCIPLES = [
  { icon: Wifi, key: 'bandwidth' },
  { icon: ShieldCheck, key: 'records' },
  { icon: Languages, key: 'chw' },
] as const;

export default function HowItWorksPage() {
  const t = useTranslations('howItWorks');
  const locale = useLocale() as Locale;

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{t('intro')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li
              key={step.key}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-700">
                  {localizeDigits(i + 1, locale)}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="w-px flex-1 bg-slate-200" aria-hidden />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <step.icon className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t(`steps.${step.key}.title`)}
                  </h2>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {t(`steps.${step.key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-center text-xl font-semibold text-slate-900">
            {t('principlesTitle')}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.key} className="rounded-xl border border-slate-200 bg-white p-5">
                <p.icon className="h-5 w-5 text-blue-600" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {t(`principles.${p.key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {t(`principles.${p.key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900">{t('readyTitle')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('readyBody')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {t('registerAsPatient')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t('browseDoctors')}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t('joinAsProvider')}
          </Link>
        </div>
      </section>
    </>
  );
}
