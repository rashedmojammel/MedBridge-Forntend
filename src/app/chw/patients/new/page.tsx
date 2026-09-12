'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';
import { useCreatePatient } from '@/hooks/usePatients';
import { useFormat } from '@/hooks/useFormat';
import { apiError } from '@/lib/api';
import type { CreatePatientResult } from '@/types';

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

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

const RELATIONS = ['SPOUSE', 'PARENT', 'SIBLING', 'CHILD', 'OTHER'] as const;

function CredentialRow({ label, value }: { label: string; value: string }) {
  const t = useTranslations('chw.patientNew');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
     
    }
  };

  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="flex-1 select-all font-mono text-sm text-slate-900">{value}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden /> {t('copied')}
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden /> {t('copy')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

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

  
  const [result, setResult] = useState<CreatePatientResult | null>(null);

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
      onSuccess: (created) => {
        toast(t('registered', { mrn: f.digits(created.patient.mrn) }));
        
        setResult(created);
      },
      onError: (e) => toast(apiError(e, t('failed')), 'error'),
    });

  const closeAndLeave = () => {
    setResult(null);
    router.push('/chw/patients');
  };

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

      <Modal
        open={Boolean(result)}
        onClose={closeAndLeave}
        title={t('credentialsTitle')}
        footer={
          <Button onClick={closeAndLeave}>{t('credentialsDone')}</Button>
        }
      >
        {result && (
          <div className="space-y-4">
            <Alert tone="warning" className="rounded-xl">
              {t('credentialsWarning')}
            </Alert>
            <CredentialRow label={t('credentialsMrn')} value={f.digits(result.patient.mrn)} />
            <CredentialRow label={t('credentialsEmail')} value={result.credentials.email} />
            <CredentialRow
              label={t('credentialsPassword')}
              value={result.credentials.tempPassword}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}