'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/components/LanguageToggle';
import { Tabs } from '@/components/ui/vercel-tabs';
import { useRouter } from 'next/navigation';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/doctors', key: 'doctors' },
  { href: '/chws', key: 'chws' },
  { href: '/how-it-works', key: 'howItWorks' },
  { href: '/contact', key: 'contact' },
] as const;

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const t = useTranslations('publicNav');
  const tc = useTranslations('common');

  // Tabs component keys by id, so route path doubles as the tab id.
  const tabs = LINKS.map((l) => ({ id: l.href, label: t(l.key), href: l.href }));
  const activeTab = LINKS.find((l) => l.href === pathname)?.href ?? '/';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-blue-600">
          <Image
            src="/medbridge-icon.png"
            alt="Medbridge"
            width={32}
            height={32}
            className="h-16 w-16"
            priority
          />
          Medbridge
        </Link>

        <nav className="hidden md:flex">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => router.push(tabId)}
          />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <Link
            href="/login"
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            {tc('logIn')}
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {tc('register')}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={tc('toggleMenu')}
            className="rounded-lg p-2 text-slate-600"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t(l.key)}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg border border-blue-600 py-2 text-center text-sm font-medium text-blue-600"
                >
                  {tc('logIn')}
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white"
                >
                  {tc('register')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}