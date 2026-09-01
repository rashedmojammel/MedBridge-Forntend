'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Stethoscope, HeartHandshake, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { usePublicSettings } from '@/hooks/useSettings';
import { usePublicStaff } from '@/hooks/useUsers';

const JOIN_PATHS = [
  { icon: Stethoscope, key: 'doctors' },
  { icon: HeartHandshake, key: 'chws' },
  { icon: Users, key: 'pharmacies' },
] as const;

export default function ContactPage() {
  const { data: settings } = usePublicSettings();
  const { data: staff, isLoading } = usePublicStaff();
  const t = useTranslations('contactPage');

  const supportEmail = settings?.supportEmail ?? 'support@medbridge.health';

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-slate-900">{t('title')}</h1>
        <p className="mt-3 text-slate-500">{t('subtitle')}</p>
      </div>

      {settings?.announcement && (
        <Alert tone="info" className="mx-auto mt-8 max-w-2xl">
          {settings.announcement}
        </Alert>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${supportEmail}`}
          className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Mail className="h-5 w-5 text-blue-600" aria-hidden />
          <h2 className="mt-3 text-sm font-semibold text-slate-900">{t('emailTitle')}</h2>
          <p className="mt-1 text-sm text-blue-600 group-hover:underline">{supportEmail}</p>
          <p className="mt-1.5 text-xs text-slate-500">{t('emailBody')}</p>
        </a>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Clock className="h-5 w-5 text-blue-600" aria-hidden />
          <h2 className="mt-3 text-sm font-semibold text-slate-900">{t('hoursTitle')}</h2>
          {/* The opening hours carry their own digits per language, so the times
              are not a mix of Latin numerals in a Bangla sentence. */}
          <p className="mt-1 text-sm text-slate-700">{t('hoursValue')}</p>
          <p className="mt-1.5 text-xs text-slate-500">{t('hoursBody')}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Phone className="h-5 w-5 text-blue-600" aria-hidden />
          <h2 className="mt-3 text-sm font-semibold text-slate-900">{t('emergencyTitle')}</h2>
          <p className="mt-1.5 text-sm text-slate-700">{t('emergencyBody')}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <MapPin className="h-5 w-5 text-blue-600" aria-hidden />
          <h2 className="mt-3 text-sm font-semibold text-slate-900">{t('whereTitle')}</h2>
          <p className="mt-1.5 text-sm text-slate-700">{t('whereBody')}</p>
          <Link
            href="/chws"
            className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
          >
            {t('seeChws')}
          </Link>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-900">{t('joinTitle')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('joinBody')}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {JOIN_PATHS.map((p) => (
            <div key={p.key} className="rounded-xl border border-slate-200 bg-white p-5">
              <p.icon className="h-5 w-5 text-blue-600" aria-hidden />
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                {t(`join.${p.key}.title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {t(`join.${p.key}.body`)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <a
            href={`mailto:${supportEmail}?subject=Provider%20application`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {t('applyByEmail')}
          </a>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-900">{t('teamTitle')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('teamBody')}</p>
        <div className="mt-6">
          {isLoading ? (
            <ListSkeleton rows={3} />
          ) : !staff?.length ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              {t('teamEmptyBefore')}{' '}
              <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">
                {supportEmail}
              </a>{' '}
              {t('teamEmptyAfter')}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <Avatar name={s.fullName} src={s.profileImage} size="lg" tone="purple" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {s.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{s.designation}</p>
                    {s.department && (
                      <Badge tone="purple" className="mt-1.5">
                        {s.department}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
