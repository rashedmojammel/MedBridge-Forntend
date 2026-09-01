'use client';

import {
  Activity,
  CalendarPlus,
  Footprints,
  LayoutDashboard,
  Send,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import RoleShell from '@/components/layout/RoleShell';

// only the first five reach the mobile bottom bar, so order is field priority;
// registering a patient stays one tap away from the patients screen itself
const NAV = [
  { href: '/chw/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { href: '/chw/patients', key: 'patients', icon: Users },
  { href: '/chw/triage', key: 'triage', icon: Activity },
  { href: '/chw/visits', key: 'visits', icon: Footprints },
  { href: '/chw/schedule', key: 'schedule', icon: CalendarPlus },
  { href: '/chw/referrals', key: 'referrals', icon: Send },
  { href: '/chw/patients/new', key: 'registerPatient', icon: UserPlus },
] as const;

export default function ChwLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav.chw');

  return (
    <RoleShell items={NAV.map(({ href, key, icon }) => ({ href, icon, label: t(key) }))}>
      {children}
    </RoleShell>
  );
}
