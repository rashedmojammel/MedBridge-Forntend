'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Stethoscope, ArrowRight, Home, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      {/* Soft decorative background - matches the brand blue, stays out of the way of content */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-50 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-lg text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-7xl font-bold tracking-tight text-slate-200 sm:text-8xl">4</span>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 sm:h-20 sm:w-20">
            <Stethoscope className="h-8 w-8 text-white sm:h-10 sm:w-10" strokeWidth={2} aria-hidden />
          </div>
          <span className="text-7xl font-bold tracking-tight text-slate-200 sm:text-8xl">4</span>
        </div>

        <h1 className="mt-8 text-2xl font-semibold text-slate-900 sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
          {t('body')}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="w-full sm:w-auto">
            <Button fullWidth className="sm:w-auto">
              <Home className="h-4 w-4" aria-hidden />
              {t('backHome')}
            </Button>
          </Link>
          <Link href="/doctors" className="w-full sm:w-auto">
            <Button variant="outline" fullWidth className="sm:w-auto">
              {t('browseDoctors')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6">
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            {t('helpText')}{' '}
            <Link href="/contact" className="font-medium text-blue-600 hover:underline">
              {t('contactLink')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}