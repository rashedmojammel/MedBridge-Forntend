'use client';

import { BookHeart, CalendarDays, LayoutDashboard, MessageSquare, Pill, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import RoleShell from '@/components/layout/RoleShell';

/**
 * Carries the message key rather than the label - `useTranslations` is a hook
 * and cannot run at module scope, so the copy is resolved in the component.
 */
const NAV = [
  { href: '/patient/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { href: '/patient/prescriptions', key: 'prescriptions', icon: Pill },
  { href: '/patient/diary', key: 'diary', icon: BookHeart },
  { href: '/patient/appointments', key: 'appointments', icon: CalendarDays },
  { href: '/patient/consultation', key: 'consultations', icon: MessageSquare },
  { href: '/patient/medicines', key: 'medicines', icon: Search },
] as const;

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav.patient');

  return (
    <RoleShell items={NAV.map(({ href, key, icon }) => ({ href, icon, label: t(key) }))}>
      {children}
    </RoleShell>
  );
}
