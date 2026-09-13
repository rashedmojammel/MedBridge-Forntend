'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import {
  AuthSwitch,
  type AuthSwitchValue,
} from '@/components/ui/AuthSwitch';

import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function AuthCard() {
  const pathname = usePathname();
  const router = useRouter();

  const mode: AuthSwitchValue = pathname?.startsWith('/register')
    ? 'register'
    : 'login';

  const handleSwitch = (next: AuthSwitchValue) => {
    if (next === mode) return;

    router.push(
      next === 'login'
        ? '/login'
        : '/register'
    );
  };

  return (
    <motion.div
      layout
      transition={{
        layout: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      }}
      className={cn(
        'w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm',
        mode === 'register'
          ? 'max-w-2xl'
          : 'max-w-sm',
      )}
    >
      {/* Header */}
      <div className="mb-6 text-center">

        {/* MedBridge Logo */}
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center">
          <Image
            src="/medbridge-icon.png"
            alt="MedBridge"
            width={44}
            height={44}
            priority
            className="h-11 w-11 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-lg font-semibold text-slate-900">
          {mode === 'login'
            ? 'Log in to Medbridge'
            : 'Create your Medbridge account'}
        </h1>

        {/* Description */}
        <p className="mt-1 text-sm text-slate-500">
          Rural healthcare consultation platform
        </p>
      </div>

      {/* Login / Register Switch */}
      <AuthSwitch
        value={mode}
        onChange={handleSwitch}
        className="mx-auto mb-6 max-w-[240px]"
      />

      {/* Form Animation */}
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        <motion.div
          key={mode}
          initial={{
            opacity: 0,
            x: mode === 'register' ? 24 : -24,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{
            opacity: 0,
            x: mode === 'register' ? -24 : 24,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          {mode === 'login' ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}