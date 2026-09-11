'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AuthSwitchValue = 'login' | 'register';

interface AuthSwitchProps {
  value: AuthSwitchValue;
  onChange: (value: AuthSwitchValue) => void;
  className?: string;
}

const OPTIONS: { value: AuthSwitchValue; label: string }[] = [
  { value: 'login', label: 'Log in' },
  { value: 'register', label: 'Register' },
];

/** Pill-style tab switch for toggling between the login and register forms. */
export function AuthSwitch({ value, onChange, className }: AuthSwitchProps) {
  return (
    <div
      role="tablist"
      aria-label="Choose login or register"
      className={cn(
        'relative grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-medium',
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 rounded-full px-4 py-2 transition-colors',
              active ? 'text-white' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {active && (
              <motion.span
                layoutId="auth-switch-pill"
                className="absolute inset-0 -z-10 rounded-full bg-blue-600"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default AuthSwitch;