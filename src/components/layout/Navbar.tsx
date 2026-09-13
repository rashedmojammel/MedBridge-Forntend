'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, LogOut, User as UserIcon, HeartPulse } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import LanguageToggle from '@/components/LanguageToggle';
import NotificationPanel from '@/components/shared/NotificationPanel';
import { useNotifications } from '@/hooks/useNotifications';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { useFormat } from '@/hooks/useFormat';
import { dashboardFor } from '@/lib/auth';
import { ROLES_WITH_BANGLA } from '@/i18n/config';
import Image from 'next/image';

export default function Navbar() {
  const user = useCurrentUser();
  const logout = useLogout();
  const { data } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations('common');
  const f = useFormat();

  const unread = data?.unreadCount ?? 0;
  const accountHref = dashboardFor(user?.role).replace('/dashboard', '/account');
  const canSwitchLanguage = !!user?.role && ROLES_WITH_BANGLA.has(user.role);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
        <Link
          href={user ? dashboardFor(user.role) : '#'}
          className="flex items-center gap-2 font-semibold text-blue-600"
        >
          <Image
            src="/medbridge-icon.png"
            alt="Medbridge"
            width={20}
            height={20}
            className="h-16 w-16"
            priority
          />
          <span>Medbridge</span>
        </Link>

        <div className="flex items-center gap-2">
          {canSwitchLanguage && <LanguageToggle className="hidden sm:flex" />}
          <button
            onClick={() => setNotifOpen(true)}
            aria-label={
              unread ? `${t('notifications')}, ${t('unreadCount', { count: unread })}` : t('notifications')
            }
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white"
              >
                {unread > 9 ? f.digits('9+') : f.num(unread)}
              </motion.span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
            >
              <Avatar name={user?.fullName} src={user?.profileImage} size="sm" />
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {user?.fullName?.split(' ')[0] ?? ''}
              </span>
              <RoleBadge role={user?.role} />
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg"
                  >
                    <div className="border-b border-slate-100 px-3 pb-2.5 pt-1.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <Link
                      href={accountHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <UserIcon className="h-4 w-4 text-slate-400" aria-hidden />
                      {t('myAccount')}
                    </Link>
                    {}
                    {canSwitchLanguage && (
                      <div className="flex items-center justify-between px-3 py-2 sm:hidden">
                        <span className="text-sm text-slate-700">{t('language')}</span>
                        <LanguageToggle />
                      </div>
                    )}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      {t('logOut')}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}