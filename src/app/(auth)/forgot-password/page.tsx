'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useForgotPassword } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [sent, setSent] = useState('');
  const t = useTranslations('auth.forgot');
  const tv = useTranslations('auth.validation');

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, tv('emailRequired')).email(tv('emailInvalid')),
      }),
    [tv],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { email: '' },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
          {sent ? (
            <MailCheck className="h-6 w-6 text-blue-600" aria-hidden />
          ) : (
            <KeyRound className="h-6 w-6 text-blue-600" aria-hidden />
          )}
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          {sent ? t('titleSent') : t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {sent ? t('subtitleSent') : t('subtitle')}
        </p>
      </div>

      {sent ? (
        <>
          {/*
            The backend deliberately answers the same way whether or not the
            email exists, so we show its message rather than confirming that an
            account was found. It arrives in English from the API - translating
            it here would mean guessing at its wording.
          */}
          <Alert tone="success" className="rounded-lg">
            {sent}
          </Alert>
          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {t('backToLogin')}
          </Link>
        </>
      ) : (
        <>
          {forgot.isError && (
            <Alert tone="danger" className="mb-4 rounded-lg">
              {apiError(forgot.error, t('failed'))}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit((v) =>
              forgot.mutate(
                { email: v.email },
                { onSuccess: (message) => setSent(message) },
              ),
            )}
            className="space-y-4"
          >
            <Input
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Button type="submit" fullWidth loading={forgot.isPending}>
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
        </>
      )}
    </motion.div>
  );
}
