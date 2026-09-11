'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import SearchBar from '@/components/shared/SearchBar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { usePublicChws } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';

const SKILLS = ['registration', 'triage', 'scheduling'] as const;

export default function ChwDirectoryPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data: chws, isLoading } = usePublicChws(debounced);
  const t = useTranslations('chwsPage');
  const tr = useTranslations('enums.role');

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-slate-900">{t('title')}</h1>
        <p className="mt-3 text-slate-500">{t('subtitle')}</p>
      </div>

      <Card className="mx-auto mt-8 max-w-3xl bg-blue-50">
        <h2 className="text-sm font-semibold text-blue-900">{t('whatTitle')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-blue-800">{t('whatBody')}</p>
      </Card>

      <div className="mx-auto mt-8 max-w-xl">
        <SearchBar value={search} onChange={setSearch} placeholder={t('searchPlaceholder')} />
      </div>

      <div className="mt-10">
        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : !chws?.length ? (
          <EmptyState
            icon={Users}
            title={t('emptyTitle')}
            description={t('emptyBody')}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chws.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <div className="group relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 transition-all hover:border-blue-300 hover:shadow-lg">
                  {/* Full-bleed photo, falls back to an icon tile when no image */}
                  {c.profileImage ? (
                    <img
                      src={c.profileImage}
                      alt={c.fullName}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                      <Users className="h-20 w-20 text-white/90" strokeWidth={1.5} aria-hidden />
                    </div>
                  )}

                  {/* Scrim so text stays legible over any photo */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <Badge tone="purple" className="relative z-10 m-3 self-start shadow-sm">
                    {tr('CHW')}
                  </Badge>

                  <div className="relative z-10 mt-auto flex flex-col p-5 text-white">
                    <p className="truncate text-lg font-semibold">{c.fullName}</p>
                    <p className="mt-1 text-xs text-white/80">
                      {t('assignedArea')}{' '}
                      <span className="font-medium">{c.assignedArea}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {SKILLS.map((s) => (
                        <Badge key={s} tone="gray" className="bg-white/15 text-white">
                          {t(`skills.${s}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}