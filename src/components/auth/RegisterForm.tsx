'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useRegister } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';

const schema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(6, 'Enter a valid phone number'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
      errorMap: () => ({ message: 'Select a gender' }),
    }),
    bloodGroup: z.string().optional(),
    address: z.string().min(3, 'Address is required'),
    emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(6, 'Emergency contact phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function RegisterForm() {
  const registerPatient = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    const { confirmPassword, ...payload } = values;
    registerPatient.mutate(payload);
  };

  return (
    <div>
      {registerPatient.isError && (
        <Alert tone="danger" className="mb-4 rounded-lg">
          {apiError(registerPatient.error, 'Registration failed')}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Personal information
          </p>
          <div className="space-y-4">
            <Input
              label="Full name"
              required
              placeholder="Rahim Ahmed"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                required
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone"
                required
                placeholder="+8801712345678"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Date of birth"
                type="date"
                required
                error={errors.dob?.message}
                {...register('dob')}
              />
              <Select
                label="Gender"
                required
                error={errors.gender?.message}
                defaultValue=""
                {...register('gender')}
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
              <Select label="Blood group" defaultValue="" {...register('bloodGroup')}>
                <option value="">Not sure</option>
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              label="Address"
              required
              placeholder="Village, District"
              error={errors.address?.message}
              {...register('address')}
            />
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Emergency contact
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Contact name"
              required
              placeholder="Guardian name"
              error={errors.emergencyContactName?.message}
              {...register('emergencyContactName')}
            />
            <Input
              label="Contact phone"
              required
              placeholder="+8801711111111"
              error={errors.emergencyContactPhone?.message}
              {...register('emergencyContactPhone')}
            />
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Account security
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              type="password"
              required
              placeholder="At least 6 characters"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              required
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        </section>

        <Button type="submit" fullWidth loading={registerPatient.isPending}>
          Create account
        </Button>
      </form>
    </div>
  );
}