'use client';

import {
  CalendarClock,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquare,
  Send,
  Users,
} from 'lucide-react';
import RoleShell from '@/components/layout/RoleShell';

// only the first five reach the mobile bottom bar, so order is clinical priority
const NAV = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctor/patients', label: 'Patients', icon: Users },
  { href: '/doctor/consultation', label: 'Consultations', icon: MessageSquare },
  { href: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/doctor/referrals', label: 'Referrals', icon: Send },
  { href: '/doctor/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/doctor/availability', label: 'Consulting hours', icon: CalendarClock },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell items={NAV}>{children}</RoleShell>;
}
