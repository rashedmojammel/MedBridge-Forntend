'use client';

import {
  FileSearch,
  LayoutDashboard,
  Pill,
  SlidersHorizontal,
  UserPlus,
  Users,
} from 'lucide-react';
import RoleShell from '@/components/layout/RoleShell';

// adding a user is reachable from the users screen, so the mobile five go to
// the things only an admin can do at all
const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/medicines', label: 'Medicines', icon: Pill },
  { href: '/admin/settings', label: 'Settings', icon: SlidersHorizontal },
  { href: '/admin/audit', label: 'Audit log', icon: FileSearch },
  { href: '/admin/users/new', label: 'Add user', icon: UserPlus },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell items={NAV}>{children}</RoleShell>;
}
