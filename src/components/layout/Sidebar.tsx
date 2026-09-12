'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: any;
}

export default function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3 lg:block">
      <nav className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              <span>{item.label}</span>
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-1 right-0 w-0.5 rounded-full bg-blue-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}