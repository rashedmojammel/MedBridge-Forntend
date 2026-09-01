'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';
import { useCreateUser } from '@/hooks/useUsers';
import { apiError } from '@/lib/api';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Phone number is required'),
  role: z.enum(['DOCTOR', 'CHW', 'PHARMACIST', 'STAFF', 'ADMIN']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  isPublic: z.boolean().optional(),
  // doctor
  specialization: z.string().optional(),
  qualifications: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
  // chw
  assignedArea: z.string().optional(),
  // staff / pharmacist
  department: z.string().optional(),
  designation: z.string().optional(),
});

export default function AddUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createUser = useCreateUser();
  const [role, setRole] = useState('DOCTOR');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { role: 'DOCTOR', isPublic: true } as any,
  });

  const onSubmit = (values: any) => {
    // strip role-specific fields that do not belong to the chosen role,
    // because the backend runs forbidNonWhitelisted on its DTO
    const base = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      role: values.role,
      password: values.password,
      isPublic: values.isPublic,
    };
    let payload: Record<string, any> = base;
    if (values.role === 'DOCTOR') {
      payload = {
        ...base,
        specialization: values.specialization,
        qualifications: values.qualifications,
        experienceYears: values.experienceYears,
        licenseNumber: values.licenseNumber,
        bio: values.bio,
      };
    } else if (values.role === 'CHW') {
      payload = { ...base, assignedArea: values.assignedArea };
    } else if (values.role === 'PHARMACIST' || values.role === 'STAFF') {
      payload = { ...base, department: values.department, designation: values.designation };
    }

    createUser.mutate(payload, {
      onSuccess: () => {
        toast('User created — share the temporary password with them');
        router.push('/admin/users');
      },
      onError: (e) => toast(apiError(e, 'Could not create user'), 'error'),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      <PageHeader
        title="Add user"
        subtitle="Create a staff account. Patients register themselves."
      />

      <Alert tone="info" className="mb-4 rounded-xl">
        Patient accounts cannot be created here — patients use the public
        registration page so their record and MRN are generated together.
      </Alert>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account
            </p>
            <div className="space-y-4">
              <Input
                label="Full name"
                required
                error={errors.fullName?.message as string}
                {...register('fullName')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  required
                  error={errors.email?.message as string}
                  {...register('email')}
                />
                <Input
                  label="Phone"
                  required
                  error={errors.phone?.message as string}
                  {...register('phone')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Role"
                  required
                  error={errors.role?.message as string}
                  {...register('role', { onChange: (e) => setRole(e.target.value) })}
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="CHW">Community health worker</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </Select>
                <Input
                  label="Temporary password"
                  type="password"
                  required
                  hint="Share this with the user"
                  error={errors.password?.message as string}
                  {...register('password')}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" {...register('isPublic')} />
                Show in the public directory
              </label>
            </div>
          </section>

          {role === 'DOCTOR' && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Doctor profile
              </p>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Specialization" placeholder="Cardiology" {...register('specialization')} />
                  <Input label="Qualifications" placeholder="MBBS, MD" {...register('qualifications')} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Experience (years)" type="number" min={0} {...register('experienceYears')} />
                  <Input label="License number" placeholder="BMDC-12345" {...register('licenseNumber')} />
                </div>
                <Textarea label="Bio" rows={3} {...register('bio')} />
              </div>
            </section>
          )}

          {role === 'CHW' && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Health worker profile
              </p>
              <Input label="Assigned area" placeholder="Block A, Lakshmipur" {...register('assignedArea')} />
            </section>
          )}

          {(role === 'PHARMACIST' || role === 'STAFF') && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Staff profile
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Department" placeholder="Pharmacy" {...register('department')} />
                <Input label="Designation" placeholder="Pharmacist" {...register('designation')} />
              </div>
            </section>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={createUser.isPending}>
              Create user
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}