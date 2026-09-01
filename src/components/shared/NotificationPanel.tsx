'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Pill,
  CalendarClock,
  PackageMinus,
  ClipboardList,
  X,
  BellOff,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import { useFormat } from '@/hooks/useFormat';
import type { Notification, NotificationType } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';

const ICONS: Record<NotificationType, { Icon: any; bg: string; fg: string }> = {
  EMERGENCY_ALERT: { Icon: AlertCircle, bg: 'bg-red-50', fg: 'text-red-600' },
  PRESCRIPTION_READY: { Icon: Pill, bg: 'bg-green-50', fg: 'text-green-600' },
  APPOINTMENT_REMINDER: { Icon: CalendarClock, bg: 'bg-purple-50', fg: 'text-purple-600' },
  LOW_STOCK: { Icon: PackageMinus, bg: 'bg-orange-50', fg: 'text-orange-600' },
  ASSIGNMENT: { Icon: ClipboardList, bg: 'bg-blue-50', fg: 'text-blue-600' },
};

export default function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const t = useTranslations('notifications');
  const tc = useTranslations('common');
  const f = useFormat();

  const notifications: Notification[] = data?.notifications ?? [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/25"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white"
            role="dialog"
            aria-label={tc('notifications')}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">{tc('notifications')}</h2>
                {data && data.unreadCount > 0 && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    {f.num(data.unreadCount)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => markAll.mutate()}
                  className="rounded px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  {t('markAllRead')}
                </button>
                <button
                  onClick={onClose}
                  aria-label={t('close')}
                  className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="scrollbar-thin flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4">
                  <ListSkeleton rows={5} />
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  icon={BellOff}
                  title={t('emptyTitle')}
                  description={t('emptyBody')}
                />
              ) : (
                notifications.map((n) => {
                  const cfg = ICONS[n.type] ?? ICONS.ASSIGNMENT;
                  return (
                    <button
                      key={n.id}
                      onClick={() => !n.isRead && markRead.mutate(n.id)}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                        !n.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}
                      >
                        <cfg.Icon className={`h-4 w-4 ${cfg.fg}`} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${
                            n.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {f.relative(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
