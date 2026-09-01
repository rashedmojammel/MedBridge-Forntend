'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Stethoscope, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import SearchBar from '@/components/shared/SearchBar';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { usePublicDoctors } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormat } from '@/hooks/useFormat';

/**
 * These are query values sent to the backend, not labels - `usePublicDoctors`
 * passes the selected one straight through as the `specialization` filter. They
 * stay English; only the chip text is translated, via enums.specialization.
 */
const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'General Medicine',
];

export default function DoctorsDirectoryPage() {
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const debounced = useDebounce(search);
  const t = useTranslations('doctorsPage');
  const tc = useTranslations('common');
  const ts = useTranslations('enums.specialization');
  const f = useFormat();

  const { data: doctors, isLoading } = usePublicDoctors(
    debounced,
    spec === 'All' ? undefined : spec,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-slate-900">{t('title')}</h1>
        <p className="mt-3 text-slate-500">{t('subtitle')}</p>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('searchPlaceholder')}
        />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {SPECIALIZATIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSpec(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              spec === s
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {ts.has(s) ? ts(s) : s}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : !doctors?.length ? (
          <EmptyState
            icon={Stethoscope}
            title={t('emptyTitle')}
            description={t('emptyBody')}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  href={`/doctors/${d.id}`}
                  className="group block h-full rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={d.fullName} src={d.profileImage} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{d.fullName}</p>
                      <Badge tone="blue" className="mt-1">
                        {d.specialization && ts.has(d.specialization)
                          ? ts(d.specialization)
                          : d.specialization}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {t('experience', {
                      years: f.num(d.experienceYears),
                      qualifications: d.qualifications ?? tc('dash'),
                    })}
                  </p>
                  {d.bio && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{d.bio}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
                    {tc('viewProfile')}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
