'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useResetPassword } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';

type FormValues = { newPassword: string; confirm: string };

const CARD = 'w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm';

 
function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const reset = useResetPassword();
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState('');
  const t = useTranslations('auth.reset');
  const tv = useTranslations('auth.validation');

  const schema = useMemo(
    () =>
      z
        .object({
          newPassword: z.string().min(6, tv('passwordMin')),
          confirm: z.string().min(1, tv('confirmRequired')),
        })
        .refine((v) => v.newPassword === v.confirm, {
          path: ['confirm'],
          message: tv('confirmMismatch'),
        }),
    [tv],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { newPassword: '', confirm: '' },
  });

  if (!token) {
    return (
      <div className={CARD}>
        <Alert tone="danger" title={t('incompleteTitle')} className="rounded-lg">
          {t('incompleteBody')}
        </Alert>
        <Link
          href="/forgot-password"
          className="mt-6 block text-center text-sm font-medium text-blue-600 hover:underline"
        >
          {t('requestNew')}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={CARD}>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle2 className="h-6 w-6 text-green-600" aria-hidden />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">{t('doneTitle')}</h1>
        </div>
        <Alert tone="success" className="rounded-lg">
          {done}
        </Alert>
        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {t('goToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className={CARD}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
          <ShieldCheck className="h-6 w-6 text-blue-600" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
      </div>

      {reset.isError && (
        <Alert tone="danger" className="mb-4 rounded-lg">
          {apiError(reset.error, t('failed'))}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit((v) =>
          reset.mutate(
            { token, newPassword: v.newPassword },
            { onSuccess: (message) => setDone(message) },
          ),
        )}
        className="space-y-4"
      >
        <div className="relative">
          <Input
            label={t('newPassword')}
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            hint={t('newPasswordHint')}
            error={errors.newPassword?.message}
            required
            className="pr-10"
            {...register('newPassword')}
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

        <Input
          label={t('confirmPassword')}
          type="password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          required
          {...register('confirm')}
        />

        <Button type="submit" fullWidth loading={reset.isPending}>
          {t('submit')}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {t('backToLogin')}
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm"
    >
      {/* useSearchParams needs a suspense boundary or the route cannot prerender */}
      <Suspense
        fallback={
          <div className={CARD}>
            <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </motion.div>
  );
}
