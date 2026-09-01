'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCreatePatient } from '@/hooks/usePatients';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';

type FormValues = {
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  phone: string;
  altPhone?: string;
  address: string;
  village?: string;
  district?: string;
  emergencyContactName: string;
  emergencyContactRelation?: string;
  emergencyContactPhone: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
};

// Written the same way in both languages, so they are values and labels at once.
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

const RELATIONS = ['SPOUSE', 'PARENT', 'SIBLING', 'CHILD', 'OTHER'] as const;

export default function RegisterPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createPatient = useCreatePatient();
  const t = useTranslations('chw.patientNew');
  const tc = useTranslations('common');
  const tn = useTranslations('nav.chw');
  const tg = useTranslations('enums.gender');
  const trel = useTranslations('enums.relation');
  const f = useFormat();

  const schema = useMemo(
    () =>
      z.object({
        fullName: z.string().min(2, t('vFullName')),
        dob: z.string().min(1, t('vDob')),
        gender: z.enum(GENDERS, {
          errorMap: () => ({ message: t('vGender') }),
        }),
        bloodGroup: z.string().optional(),
        phone: z.string().min(6, t('vPhone')),
        altPhone: z.string().optional(),
        address: z.string().min(3, t('vAddress')),
        village: z.string().optional(),
        district: z.string().optional(),
        emergencyContactName: z.string().min(2, t('vEcName')),
        emergencyContactRelation: z.string().optional(),
        emergencyContactPhone: z.string().min(6, t('vEcPhone')),
        allergies: z.string().optional(),
        chronicConditions: z.string().optional(),
        currentMedications: z.string().optional(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) =>
    createPatient.mutate(values, {
      onSuccess: (patient) => {
        toast(t('registered', { mrn: f.digits(patient.mrn) }));
        router.push('/chw/patients');
      },
      onError: (e) => toast(apiError(e, t('failed')), 'error'),
    });

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {tc('back')}
      </button>

      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('personal')}
            </p>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={t('fullName')} required error={errors.fullName?.message} {...register('fullName')} />
                <Input label={t('dob')} type="date" required error={errors.dob?.message} {...register('dob')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label={tc('gender')} required defaultValue="" error={errors.gender?.message} {...register('gender')}>
                  <option value="" disabled>{tc('select')}</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{tg(g)}</option>
                  ))}
                </Select>
                <Select label={tc('bloodGroup')} defaultValue="" {...register('bloodGroup')}>
                  <option value="">{t('notKnown')}</option>
                  {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={tc('phone')} required error={errors.phone?.message} {...register('phone')} />
                <Input label={tc('altPhone')} {...register('altPhone')} />
              </div>
              <Input label={tc('address')} required error={errors.address?.message} {...register('address')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={tc('village')} {...register('village')} />
                <Input label={tc('district')} {...register('district')} />
              </div>
            </div>
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('emergency')}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label={tc('name')} required error={errors.emergencyContactName?.message} {...register('emergencyContactName')} />
              <Select label={t('relation')} defaultValue="" {...register('emergencyContactRelation')}>
                <option value="">{tc('select')}</option>
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>{trel(r)}</option>
                ))}
              </Select>
              <Input label={tc('phone')} required error={errors.emergencyContactPhone?.message} {...register('emergencyContactPhone')} />
            </div>
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('history')}
            </p>
            <div className="space-y-4">
              <Input label={tc('allergies')} placeholder={t('allergiesPlaceholder')} {...register('allergies')} />
              <Input label={t('chronic')} placeholder={t('chronicPlaceholder')} {...register('chronicConditions')} />
              <Input label={t('currentMeds')} placeholder={t('medsPlaceholder')} {...register('currentMedications')} />
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              {tc('cancel')}
            </Button>
            <Button type="submit" loading={createPatient.isPending}>
              {tn('registerPatient')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
