'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  ArrowRight,
  HeartPulse,
  Brain,
  Baby,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import SearchBar from '@/components/shared/SearchBar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { usePublicDoctors } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormat } from '@/hooks/useFormat';


const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'General Medicine',
];


const SPECIALTY_STYLE: Record<string, { icon: LucideIcon; gradient: string }> = {
  Cardiology: { icon: HeartPulse, gradient: 'from-rose-400 to-rose-600' },
  Neurology: { icon: Brain, gradient: 'from-violet-400 to-violet-600' },
  Pediatrics: { icon: Baby, gradient: 'from-amber-400 to-amber-600' },
  Dermatology: { icon: Sparkles, gradient: 'from-emerald-400 to-emerald-600' },
  'General Medicine': { icon: Stethoscope, gradient: 'from-blue-400 to-blue-600' },
};
const DEFAULT_SPECIALTY_STYLE = { icon: Stethoscope, gradient: 'from-slate-400 to-slate-600' };

function specialtyStyle(spec?: string) {
  return (spec && SPECIALTY_STYLE[spec]) || DEFAULT_SPECIALTY_STYLE;
}

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
            {doctors.map((d, i) => {
              const { icon: SpecIcon, gradient } = specialtyStyle(d.specialization);
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Link
                    href={`/doctors/${d.id}`}
                    className="group relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 transition-all hover:border-blue-300 hover:shadow-lg"
                  >
                    {d.profileImage ? (
                      <img
                        src={d.profileImage}
                        alt={d.fullName}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient}`}
                      >
                        <SpecIcon
                          className="h-20 w-20 text-white/90"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    <Badge tone="blue" className="relative z-10 m-3 self-start shadow-sm">
                      {d.specialization && ts.has(d.specialization)
                        ? ts(d.specialization)
                        : d.specialization}
                    </Badge>

                    <div className="relative z-10 mt-auto flex flex-col p-5 text-white">
                      <p className="truncate text-lg font-semibold">{d.fullName}</p>
                      <p className="mt-1 text-xs text-white/80">
                        {t('experience', {
                          years: f.num(d.experienceYears),
                          qualifications: d.qualifications ?? tc('dash'),
                        })}
                      </p>
                      {d.bio && (
                        <p className="mt-2 line-clamp-2 text-sm text-white/80">{d.bio}</p>
                      )}

                      <span className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors group-hover:bg-blue-700">
                        {tc('viewProfile')}
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}