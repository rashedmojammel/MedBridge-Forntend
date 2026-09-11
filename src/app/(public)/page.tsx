'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Stethoscope,
  BellRing,
  Pill,
  CalendarClock,
  ArrowRight,
  Check,
} from 'lucide-react';
import { CountingNumber } from '@/components/ui/CountingNumber';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4 },
};

const STEPS = [
  {
    n: '01',
    title: 'Register with a health worker',
    body: 'A Community Health Worker registers you and assigns a permanent Medical Record Number.',
  },
  {
    n: '02',
    title: 'Vitals are recorded',
    body: 'Your CHW measures temperature, blood pressure, pulse, and oxygen. Critical readings alert doctors instantly.',
  },
  {
    n: '03',
    title: 'Chat with a doctor',
    body: 'A qualified doctor reviews your case and consults with you over text. No video, no bandwidth problems.',
  },
];

const STATS = [
  { target: 50, suffix: '+', label: 'Doctors' },
  { target: 120, suffix: '+', label: 'Health workers' },
  { target: 5000, suffix: '+', label: 'Patients served' },
  { target: 1200, suffix: '+', label: 'Consultations' },
];

const FEATURES = [
  { Icon: MessageSquare, title: 'Chat consultations', body: 'Text-based, so it works on any connection.' },
  { Icon: FileText, title: 'Digital prescriptions', body: 'View and download prescriptions anytime.' },
  { Icon: Stethoscope, title: 'Community health workers', body: 'Trained CHWs bridge villages and doctors.' },
  { Icon: BellRing, title: 'Emergency alerts', body: 'Critical vitals notify doctors immediately.' },
  { Icon: Pill, title: 'Medicine search', body: 'Search thousands of Bangladesh medicines.' },
  { Icon: CalendarClock, title: 'Follow-up care', body: 'Schedule follow-ups and get reminders.' },
];

export default function HomePage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Rural healthcare · Bangladesh
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">
            Healthcare for every village.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            Connect with qualified doctors from anywhere in Bangladesh. No travel,
            no long queues — just a conversation.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Find a doctor <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-blue-600 px-5 py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              Register as patient
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            {['Free for rural patients', 'Licensed doctors', 'Works on 2G'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-green-600" aria-hidden />
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
              SM
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Dr. Sarah Miller</p>
              <p className="flex items-center gap-1.5 text-xs text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" /> Online
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="max-w-[80%] rounded-xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              Hello Rahim, how are you feeling today?
            </div>
            <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-blue-600 px-3.5 py-2.5 text-sm text-white">
              Fever since two days, and a headache.
            </div>
            <div className="max-w-[80%] rounded-xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              I can see your vitals from the health worker. Let me review them.
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
            <div className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              Prescription ready
            </div>
            <div className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700">
              Follow-up booked
            </div>
          </div>
        </motion.div>
      </section>

      <section ref={statsRef} className="bg-blue-600">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold text-white">
                <CountingNumber
                  target={stat.target}
                  autoStart={statsInView}
                  transition={{ duration: 1.8, ease: 'easeOut', delay: i * 0.1 }}
                />
                {stat.suffix}
              </p>
              <p className="mt-1 text-sm text-blue-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900">How Medbridge works</h2>
          <p className="mt-3 text-slate-500">
            Three steps from your village to a qualified doctor.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              {...fadeUp}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <span className="text-2xl font-semibold text-blue-200">{s.n}</span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-3 text-slate-500">
              Built for low-bandwidth rural connections.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <f.Icon className="h-[18px] w-[18px] text-blue-600" aria-hidden />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div
          {...fadeUp}
          className="rounded-2xl bg-blue-600 px-8 py-14 text-center"
        >
          <h2 className="text-2xl font-semibold text-white lg:text-3xl">
            Ready to consult a doctor?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-blue-100">
            Registration takes under two minutes and is free for rural patients.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
            >
              Register as patient
            </Link>
            <Link
              href="/doctors"
              className="rounded-lg border border-white/60 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Browse doctors
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}