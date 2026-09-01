'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, HeartPulse } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
          <HeartPulse className="h-6 w-6 text-blue-600" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
      </div>

      {login.isError && (
        <Alert tone="danger" className="mb-4 rounded-lg">
          {apiError(login.error, t('invalid'))}
        </Alert>
      )}

      <form onSubmit={handleSubmit((v) => login.mutate({ email: v.email!, password: v.password! }))} className="space-y-4">
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
  );
}
