'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HeartPulse, ShieldCheck, Users, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useRegister } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  password: string;
  confirmPassword: string;
};

// Blood groups are written the same way in both languages, so they are values
// and labels at once.
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

export default function RegisterPage() {
  const registerPatient = useRegister();
  const t = useTranslations('auth.register');
  const tv = useTranslations('auth.validation');
  const tg = useTranslations('enums.gender');
  const tc = useTranslations('common');

  const schema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().min(2, tv('fullNameMin')),
          email: z.string().email(tv('emailInvalid')),
          phone: z.string().min(6, tv('phoneInvalid')),
          dob: z.string().min(1, tv('dobRequired')),
          gender: z.enum(GENDERS, {
            errorMap: () => ({ message: tv('genderRequired') }),
          }),
          bloodGroup: z.string().optional(),
          address: z.string().min(3, tv('addressRequired')),
          emergencyContactName: z.string().min(2, tv('emergencyNameRequired')),
          emergencyContactPhone: z.string().min(6, tv('emergencyPhoneRequired')),
          password: z.string().min(6, tv('passwordMin')),
          confirmPassword: z.string(),
        })
        .refine((d) => d.password === d.confirmPassword, {
          message: tv('passwordsMismatch'),
          path: ['confirmPassword'],
        }),
    [tv],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as any });

  const onSubmit = (values: FormValues) => {
    const { confirmPassword, ...payload } = values;
    registerPatient.mutate(payload);
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
            {t('brandTitle', { default: 'Your care, one step ahead.' })}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80">
            {t('brandSubtitle', {
              default:
                'Create your patient account to book visits, reach your care team, and keep your records in one place.',
            })}
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10">
                <ShieldCheck className="h-4 w-4 text-white" aria-hidden />
              </div>
              <p className="text-sm text-blue-100/80">
                {t('brandPoint1', { default: 'Your data is encrypted and only shared with your care team.' })}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10">
                <Users className="h-4 w-4 text-white" aria-hidden />
              </div>
              <p className="text-sm text-blue-100/80">
                {t('brandPoint2', { default: 'Get matched with doctors and community health workers near you.' })}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10">
                <Activity className="h-4 w-4 text-white" aria-hidden />
              </div>
              <p className="text-sm text-blue-100/80">
                {t('brandPoint3', { default: 'Takes less than five minutes to set up.' })}
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-blue-100/50">
          © {new Date().getFullYear()} MedBridge. {t('brandFooter', { default: 'All rights reserved.' })}
        </p>
      </div>

      {/* Form panel - only this scrolls, page itself never does */}
      <div className="flex h-full items-center justify-center overflow-hidden bg-slate-50 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-full w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 flex items-center gap-2.5 lg:hidden">
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 transition-colors hover:bg-blue-100"
                aria-label="Go to homepage"
              >
                <HeartPulse className="h-4.5 w-4.5 text-blue-600" aria-hidden />
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-lg font-semibold text-slate-900">{t('title')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
            </div>

            {registerPatient.isError && (
              <Alert tone="danger" className="mb-4 rounded-lg">
                {apiError(registerPatient.error, t('failed'))}
              </Alert>
            )}

            <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <section>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('personalSection')}
                </p>
                <div className="space-y-4">
                  <Input
                    label={t('fullName')}
                    required
                    placeholder={t('fullNamePlaceholder')}
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t('email')}
                      type="email"
                      required
                      placeholder={t('emailPlaceholder')}
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    {/* Phone examples stay in ASCII digits: this is a field the reader
                        types into, and Bengali numerals are not accepted there. */}
                    <Input
                      label={t('phone')}
                      required
                      placeholder="+8801712345678"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label={t('dob')}
                      type="date"
                      required
                      error={errors.dob?.message}
                      {...register('dob')}
                    />
                    <Select
                      label={t('gender')}
                      required
                      error={errors.gender?.message}
                      defaultValue=""
                      {...register('gender')}
                    >
                      <option value="" disabled>
                        {t('selectPlaceholder')}
                      </option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {tg(g)}
                        </option>
                      ))}
                    </Select>
                    <Select label={t('bloodGroup')} defaultValue="" {...register('bloodGroup')}>
                      <option value="">{t('notSure')}</option>
                      {BLOOD_GROUPS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Input
                    label={t('address')}
                    required
                    placeholder={t('addressPlaceholder')}
                    error={errors.address?.message}
                    {...register('address')}
                  />
                </div>
              </section>

              <section>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('emergencySection')}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('contactName')}
                    required
                    placeholder={t('contactNamePlaceholder')}
                    error={errors.emergencyContactName?.message}
                    {...register('emergencyContactName')}
                  />
                  <Input
                    label={t('contactPhone')}
                    required
                    placeholder="+8801711111111"
                    error={errors.emergencyContactPhone?.message}
                    {...register('emergencyContactPhone')}
                  />
                </div>
              </section>

              <section>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('securitySection')}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('password')}
                    type="password"
                    required
                    placeholder={t('passwordPlaceholder')}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <Input
                    label={t('confirmPassword')}
                    type="password"
                    required
                    placeholder={t('confirmPasswordPlaceholder')}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                </div>
              </section>
            </form>
          </div>

          {/* Fixed bottom bar: submit + login link, always visible regardless of scroll */}
          <div className="flex-none space-y-3 border-t border-slate-100 p-5">
            <Button type="submit" form="register-form" fullWidth loading={registerPatient.isPending}>
              {t('submit')}
            </Button>
            <p className="text-center text-sm text-slate-500">
              {t('already')}{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                {tc('logIn')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}