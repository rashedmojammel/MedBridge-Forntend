'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from './Sidebar';

/** Mobile-only tab bar - mirrors the sidebar items. */
export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const visible = items.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white lg:hidden">
      {visible.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              active ? 'text-blue-600' : 'text-slate-400',
            )}
          >
            <item.icon className="h-5 w-5" aria-hidden />
            <span className="truncate px-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
