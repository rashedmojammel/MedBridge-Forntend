'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, HeartPulse, ShieldCheck, Users, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useLogin } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';
import type { UserRole } from '@/types';

type FormValues = { email: string; password: string };

// Addresses of the seeded accounts - literal credentials, never translated.
const DEMO: { role: UserRole; email: string }[] = [
  { role: 'ADMIN', email: 'admin@medbridge.com' },
  { role: 'DOCTOR', email: 'doctor1@medbridge.com' },
  { role: 'CHW', email: 'chw1@medbridge.com' },
  { role: 'PHARMACIST', email: 'pharmacist1@medbridge.com' },
];

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const login = useLogin();
  const t = useTranslations('auth.login');
  const tv = useTranslations('auth.validation');
  const tr = useTranslations('enums.role');

  // Built inside the component so the messages follow the reading language;
  // a module-level schema would freeze whichever language loaded first.
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, tv('emailRequired')).email(tv('emailInvalid')),
        password: z.string().min(6, tv('passwordMin')),
      }),
    [tv],
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { email: '', password: '' },
  });

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 grid overflow-hidden lg:grid-cols-2">
      {/* Branding panel */}
      <div className="relative hidden h-full overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <HeartPulse className="h-5 w-5 text-white" aria-hidden />
          </div>
          <span className="text-lg font-semibold text-white">MedBridge</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            {t('brandTitle', { default: 'Care coordination, in one place.' })}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80">
            {t('brandSubtitle', {
              default:
                'Connect patients, doctors, community health workers, and pharmacists on a single trusted platform.',
            })}
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10">
                <ShieldCheck className="h-4 w-4 text-white" aria-hidden />
              </div>
              <p className="text-sm text-blue-100/80">
                {t('brandPoint1', { default: 'Secure, role-based access for every care team member.' })}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10">
                <Users className="h-4 w-4 text-white" aria-hidden />
              </div>
              <p className="text-sm text-blue-100/80">
                {t('brandPoint2', { default: 'Built for real-world clinics, not just hospitals.' })}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10">
                <Activity className="h-4 w-4 text-white" aria-hidden />
              </div>
              <p className="text-sm text-blue-100/80">
                {t('brandPoint3', { default: 'Live updates so nothing falls through the cracks.' })}
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-blue-100/50">
          © {new Date().getFullYear()} MedBridge. {t('brandFooter', { default: 'All rights reserved.' })}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex h-full items-center justify-center overflow-hidden bg-slate-50 p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-6 text-center lg:hidden">
            <Link
              href="/"
              className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 transition-colors hover:bg-blue-100"
              aria-label="Go to homepage"
            >
              <HeartPulse className="h-6 w-6 text-blue-600" aria-hidden />
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-lg font-semibold text-slate-900">{t('title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
          </div>

          {login.isError && (
            <Alert tone="danger" className="mb-4 rounded-lg">
              {apiError(login.error, t('invalid'))}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit((v) => login.mutate({ email: v.email!, password: v.password! }))}
            className="space-y-4"
          >
            <Input
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div className="relative">
              <Input
                label={t('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                error={errors.password?.message}
                required
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? t('hidePassword') : t('showPassword')}
                className="absolute right-3 top-[30px] text-slate-400 transition-colors hover:text-slate-600"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {t('forgot')}
              </Link>
            </div>

            <Button type="submit" fullWidth loading={login.isPending}>
              {t('submit')}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">{t('demoDivider')}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => fillDemo(d.email)}
                className="rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-blue-500 hover:text-blue-600"
              >
                {tr(d.role)}
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('newPatient')}{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
              {t('createAccount')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}