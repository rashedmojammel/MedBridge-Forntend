'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, GraduationCap, Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { usePublicDoctor } from '@/hooks/useUsers';
import { useFormat } from '@/hooks/useFormat';

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: doctor, isLoading } = usePublicDoctor(id);
  const t = useTranslations('doctorProfile');
  const tc = useTranslations('common');
  const ts = useTranslations('enums.specialization');
  const f = useFormat();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-14">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (!doctor) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-slate-500">{t('notFound')}</p>
        <Link href="/doctors" className="mt-3 inline-block text-sm text-blue-600">
          {t('backToDoctors')}
        </Link>
      </div>
    );
  }

  const specialization =
    doctor.specialization && ts.has(doctor.specialization)
      ? ts(doctor.specialization)
      : doctor.specialization;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/doctors"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t('backToDoctors')}
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit text-center">
          <Avatar
            name={doctor.fullName}
            src={doctor.profileImage}
            size="xl"
            className="mx-auto"
          />
          <h1 className="mt-4 text-lg font-semibold text-slate-900">{doctor.fullName}</h1>
          <Badge tone="blue" className="mt-2">
            {specialization}
          </Badge>
          <p className="mt-3 text-sm text-slate-500">
            {t('yearsOfExperience', { years: f.num(doctor.experienceYears) })}
          </p>
          <div className="mt-5 space-y-2">
            <Link href="/register" className="block">
              <Button fullWidth>{t('registerToConsult')}</Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="outline" fullWidth>
                {tc('logIn')}
              </Button>
            </Link>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-slate-900">{t('about')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {doctor.bio ?? t('noBio')}
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <div className="flex items-center gap-2 text-slate-400">
                <GraduationCap className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {t('qualifications')}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{doctor.qualifications}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-slate-400">
                <Briefcase className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {t('experience')}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {t('experienceIn', {
                  years: f.num(doctor.experienceYears),
                  specialization: specialization ?? tc('dash'),
                })}
              </p>
            </Card>
          </div>

          <Card className="bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-900">
              {t('howToTitle', { name: doctor.fullName })}
            </h3>
            <ol className="mt-3 space-y-2 text-sm text-blue-800">
              
              <li>{t('how1')}</li>
              <li>{t('how2')}</li>
              <li>{t('how3')}</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
