'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Stethoscope,
  BellRing,
  Pill,
  CalendarClock,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormat } from '@/hooks/useFormat';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4 },
};

// Structure only. Copy lives in messages/*.json under home.steps.<key> and is
// resolved at render, so a language switch does not need a reload.
const STEPS = [
  { n: '01', key: 'register' },
  { n: '02', key: 'vitals' },
  { n: '03', key: 'chat' },
] as const;

const FEATURES = [
  { Icon: MessageSquare, key: 'chat' },
  { Icon: FileText, key: 'prescriptions' },
  { Icon: Stethoscope, key: 'chws' },
  { Icon: BellRing, key: 'alerts' },
  { Icon: Pill, key: 'medicines' },
  { Icon: CalendarClock, key: 'followUp' },
] as const;

const ASSURANCES = ['free', 'licensed', 'lowBandwidth'] as const;

const STATS = ['doctors', 'chws', 'patients', 'consultations'] as const;

export default function HomePage() {
  const t = useTranslations('home');
  const f = useFormat();

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {t('eyebrow')}
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            {t('subtitle')}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {t('findDoctor')} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-blue-600 px-5 py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              {t('registerAsPatient')}
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            {ASSURANCES.map((key) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-green-600" aria-hidden />
                {t(`assurance.${key}`)}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
              SM
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{t('demo.doctorName')}</p>
              <p className="flex items-center gap-1.5 text-xs text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" /> {t('demo.online')}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="max-w-[80%] rounded-xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              {t('demo.msg1')}
            </div>
            <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-blue-600 px-3.5 py-2.5 text-sm text-white">
              {t('demo.msg2')}
            </div>
            <div className="max-w-[80%] rounded-xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              {t('demo.msg3')}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
            <div className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              {t('demo.prescriptionReady')}
            </div>
            <div className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700">
              {t('demo.followUpBooked')}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-blue-600">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 lg:grid-cols-4">
          {STATS.map((key) => (
            <div key={key} className="text-center">
              {/* The figures carry their own digits per language, so "5,000+"
                  becomes "৫,০০০+" rather than a half-translated mix. */}
              <p className="text-3xl font-semibold text-white">{t(`stats.${key}Value`)}</p>
              <p className="mt-1 text-sm text-blue-100">{t(`stats.${key}Label`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900">{t('stepsTitle')}</h2>
          <p className="mt-3 text-slate-500">{t('stepsSubtitle')}</p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              {...fadeUp}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <span className="text-2xl font-semibold text-blue-200">{f.digits(s.n)}</span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">
                {t(`steps.${s.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {t(`steps.${s.key}.body`)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">
              {t('featuresTitle')}
            </h2>
            <p className="mt-3 text-slate-500">{t('featuresSubtitle')}</p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.key}
                {...fadeUp}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <feature.Icon className="h-[18px] w-[18px] text-blue-600" aria-hidden />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm text-slate-500">
                  {t(`features.${feature.key}.body`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div
          {...fadeUp}
          className="rounded-2xl bg-blue-600 px-8 py-14 text-center"
        >
          <h2 className="text-2xl font-semibold text-white lg:text-3xl">
            {t('ctaTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-blue-100">{t('ctaBody')}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
            >
              {t('registerAsPatient')}
            </Link>
            <Link
              href="/doctors"
              className="rounded-lg border border-white/60 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              {t('browseDoctors')}
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
