'use client';

import { LayoutDashboard, Package, PackageCheck, Pill, PlusCircle } from 'lucide-react';
import RoleShell from '@/components/layout/RoleShell';


const NAV = [
  { href: '/pharmacist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pharmacist/dispensing', label: 'Dispensing', icon: PackageCheck },
  { href: '/pharmacist/inventory', label: 'Inventory', icon: Package },
  { href: '/pharmacist/medicines', label: 'Medicines', icon: Pill },
  { href: '/pharmacist/medicines/new', label: 'Add medicine', icon: PlusCircle },
];


export default function PharmacistLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell items={NAV}>{children}</RoleShell>;
}
