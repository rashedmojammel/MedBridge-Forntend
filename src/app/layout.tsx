import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import Providers from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Medbridge — Rural Healthcare Consultation Platform',
  description:
    'Connecting village patients in Bangladesh with qualified doctors through secure chat consultations.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Set server-side so the correct lang is on the very first paint - no flash of
  // English, and screen readers pick the right pronunciation immediately.
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Both families load in both languages. Inter carries no Bengali glyphs,
          so the browser falls through per codepoint - Latin in Inter, Bengali in
          Noto Sans Bengali - which keeps mixed strings like "MRN-000123" and
          drug names readable without any conditional class logic.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
