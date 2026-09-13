'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useLogin } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

const DEMO = [
  { label: 'Admin', email: 'admin@medbridge.com' },
  { label: 'Doctor', email: 'doctor1@medbridge.com' },
  { label: 'CHW', email: 'chw1@medbridge.com' },
  { label: 'Pharmacist', email: 'pharmacist1@medbridge.com' },
];

export default function LoginForm() {
  const [showPwd, setShowPwd] = useState(false);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { email: '', password: '' },
  });

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <div>
      {login.isError && (
        <Alert tone="danger" className="mb-4 rounded-lg">
          {apiError(login.error, 'Invalid email or password')}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit((v) => login.mutate({ email: v.email!, password: v.password! }))}
        className="space-y-4"
      >
        <Input
          label="Email"
          type="email"
          placeholder="name@medbridge.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="Your password"
            error={errors.password?.message}
            required
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-[30px] text-slate-400 transition-colors hover:text-slate-600"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={login.isPending}>
          Log in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or use a demo account</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DEMO.map((d) => (
          <button
            key={d.label}
            type="button"
            onClick={() => fillDemo(d.email)}
            className="rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-blue-500 hover:text-blue-600"
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}