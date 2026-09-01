'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Camera, Mail, Phone, ShieldCheck, UserCog } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge, { RoleBadge } from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  useSetUserActive,
  useUpdateUser,
  useUploadPhoto,
  useUser,
} from '@/hooks/useUsers';
import { apiError } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

/** GET /users/:id answers with the account and its role-specific profile row. */
interface UserDetail {
  user: User;
  profile: {
    id: number;
    specialization?: string;
    qualifications?: string;
    experienceYears?: number;
    licenseNumber?: string;
    bio?: string;
    assignedArea?: string;
    activeSince?: string;
    department?: string;
    designation?: string;
  } | null;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-slate-800">{value || '—'}</p>
    </div>
  );
}

export default function AdminUserPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data, isLoading } = useUser(id) as { data?: UserDetail; isLoading: boolean };

  const uploadPhoto = useUploadPhoto();
  const setActive = useSetUserActive();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (isLoading) return <ListSkeleton rows={5} />;

  const user = data?.user;
  const profile = data?.profile ?? null;

  if (!user) {
    return (
      <Card>
        <EmptyState
          icon={UserCog}
          title="User not found"
          description="This account may have been removed."
          action={
            <Link href="/admin/users">
              <Button size="sm" variant="outline">
                Back to users
              </Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const onPickPhoto = (file?: File) => {
    if (!file) return;
    uploadPhoto.mutate(
      { id: user.id, file },
      {
        onSuccess: () => toast('Photo updated'),
        onError: (e) => toast(apiError(e, 'Could not upload photo'), 'error'),
      },
    );
  };

  const toggleActive = () => {
    setActive.mutate(
      { id: user.id, isActive: !user.isActive },
      {
        onSuccess: () => {
          toast(user.isActive ? 'Account deactivated' : 'Account reactivated');
          setConfirming(false);
        },
        onError: (e) => toast(apiError(e, 'Could not change the account'), 'error'),
      },
    );
  };

  const isDoctor = user.role === 'DOCTOR';
  const isChw = user.role === 'CHW';
  // STAFF, PHARMACIST, and ADMIN all share the Staff profile table
  const isStaffLike = !isDoctor && !isChw && user.role !== 'PATIENT';

  return (
    <>
      <Link
        href="/admin/users"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to users
      </Link>

      <PageHeader
        title={user.fullName}
        subtitle="Account details and role profile."
        action={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant={user.isActive ? 'danger' : 'primary'}
              onClick={() => setConfirming(true)}
            >
              {user.isActive ? 'Deactivate' : 'Reactivate'}
            </Button>
          </>
        }
      />

      {!user.isActive && (
        <Alert tone="warning" title="Account deactivated" className="mb-4">
          This person cannot sign in. Their records and authorship stay intact.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={user.fullName} src={user.profileImage} size="xl" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-slate-900">{user.fullName}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {user.phone}
                    </span>
                  )}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <RoleBadge role={user.role} />
                  <Badge tone={user.isActive ? 'green' : 'gray'}>
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </Badge>
                  {user.isPublic && <Badge tone="blue">Listed publicly</Badge>}
                </div>
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickPhoto(e.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  loading={uploadPhoto.isPending}
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-4 w-4" aria-hidden />
                  Change photo
                </Button>
                <p className="mt-1.5 text-center text-[11px] text-slate-400">
                  Images only, max 2 MB
                </p>
              </div>
            </div>
          </Card>

          {isDoctor && (
            <Card>
              <CardHeader title="Doctor profile" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Specialization" value={profile?.specialization} />
                <Field label="Qualifications" value={profile?.qualifications} />
                <Field
                  label="Experience"
                  value={
                    profile?.experienceYears != null
                      ? `${profile.experienceYears} years`
                      : undefined
                  }
                />
                <Field label="License number" value={profile?.licenseNumber} />
              </div>
              {profile?.bio && (
                <div className="mt-4">
                  <Field label="Bio" value={profile.bio} />
                </div>
              )}
            </Card>
          )}

          {isChw && (
            <Card>
              <CardHeader title="Health worker profile" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Assigned area" value={profile?.assignedArea} />
                <Field label="Active since" value={formatDate(profile?.activeSince)} />
              </div>
            </Card>
          )}

          {isStaffLike && (
            <Card>
              <CardHeader title="Staff profile" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Department" value={profile?.department} />
                <Field label="Designation" value={profile?.designation} />
              </div>
              {/*
                updateUser only writes back doctor and CHW profile rows, so these
                two are shown read-only rather than in a form that would appear
                to save and then quietly not.
              */}
              <p className="mt-4 text-xs text-slate-400">
                Department and designation are set when the account is created and are not
                editable here.
              </p>
            </Card>
          )}

          {user.role === 'PATIENT' && (
            <Card>
              <CardHeader title="Patient account" />
              <p className="text-sm text-slate-600">
                Patients hold their clinical record separately from this login. Look them up
                under a health worker&apos;s patient list to see triage, prescriptions, and
                diary entries.
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Account" />
            <div className="space-y-3">
              <Field label="User ID" value={`#${user.id}`} />
              <Field label="Role" value={<RoleBadge role={user.role} />} />
              <Field label="Created" value={formatDate(user.createdAt)} />
              <Field
                label="Public directory"
                value={
                  user.isPublic ? (
                    <Badge tone="blue">Visible</Badge>
                  ) : (
                    <Badge tone="gray">Hidden</Badge>
                  )
                }
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="What an admin cannot do" />
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Change someone&apos;s email or role — both are fixed once the account
                exists.
              </li>
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Read or reset a password. People reset their own from the sign-in page.
              </li>
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Delete an account. Deactivating revokes access and keeps the record.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {editing && (
        <EditUser
          user={user}
          profile={profile}
          onClose={() => setEditing(false)}
        />
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={toggleActive}
        loading={setActive.isPending}
        danger={Boolean(user.isActive)}
        title={user.isActive ? 'Deactivate this account?' : 'Reactivate this account?'}
        confirmLabel={user.isActive ? 'Deactivate' : 'Reactivate'}
        description={
          user.isActive
            ? `${user.fullName} will no longer be able to sign in. Everything they have recorded stays exactly as it is.`
            : `${user.fullName} will be able to sign in again with their existing password.`
        }
      />
    </>
  );
}

function EditUser({
  user,
  profile,
  onClose,
}: {
  user: User;
  profile: UserDetail['profile'];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const update = useUpdateUser();

  const [form, setForm] = useState({
    fullName: user.fullName,
    phone: user.phone ?? '',
    isPublic: Boolean(user.isPublic),
    specialization: profile?.specialization ?? '',
    qualifications: profile?.qualifications ?? '',
    experienceYears:
      profile?.experienceYears != null ? String(profile.experienceYears) : '',
    licenseNumber: profile?.licenseNumber ?? '',
    bio: profile?.bio ?? '',
    assignedArea: profile?.assignedArea ?? '',
  });

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.fullName.trim()) return toast('A name is required', 'error');

    // only send what this role actually persists - unknown keys are rejected
    // outright, and staff profile fields are ignored server-side
    const payload: Record<string, unknown> = {
      fullName: form.fullName.trim(),
      isPublic: form.isPublic,
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
    };

    if (user.role === 'DOCTOR') {
      if (form.specialization.trim()) payload.specialization = form.specialization.trim();
      if (form.qualifications.trim()) payload.qualifications = form.qualifications.trim();
      if (form.experienceYears) payload.experienceYears = Number(form.experienceYears);
      if (form.licenseNumber.trim()) payload.licenseNumber = form.licenseNumber.trim();
      if (form.bio.trim()) payload.bio = form.bio.trim();
    }
    if (user.role === 'CHW' && form.assignedArea.trim()) {
      payload.assignedArea = form.assignedArea.trim();
    }

    update.mutate(
      { id: user.id, payload },
      {
        onSuccess: () => {
          toast('Account updated');
          onClose();
        },
        onError: (e) => toast(apiError(e, 'Could not save the changes'), 'error'),
      },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.fullName}`}
      width="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={update.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>

        <Input label="Email" value={user.email} disabled hint="Email cannot be changed" />

        {user.role === 'DOCTOR' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Specialization"
                placeholder="General Medicine"
                value={form.specialization}
                onChange={(e) => set('specialization', e.target.value)}
              />
              <Input
                label="Qualifications"
                placeholder="MBBS, FCPS"
                value={form.qualifications}
                onChange={(e) => set('qualifications', e.target.value)}
              />
              <Input
                label="Years of experience"
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => set('experienceYears', e.target.value)}
              />
              <Input
                label="License number"
                value={form.licenseNumber}
                onChange={(e) => set('licenseNumber', e.target.value)}
              />
            </div>
            <Textarea
              label="Bio"
              rows={3}
              placeholder="Shown in the public doctor directory"
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
            />
          </>
        )}

        {user.role === 'CHW' && (
          <Input
            label="Assigned area"
            placeholder="Savar Union 3"
            value={form.assignedArea}
            onChange={(e) => set('assignedArea', e.target.value)}
          />
        )}

        <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
            checked={form.isPublic}
            onChange={(e) => set('isPublic', e.target.checked)}
          />
          <span className="text-sm">
            <span className="font-medium text-slate-800">List in the public directory</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Doctors, health workers, and staff only appear on the public site when this is
              ticked and the account is active.
            </span>
          </span>
        </label>

        <Alert tone="info" className="rounded-lg">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Role and email are immutable — create a new account if either is wrong.
          </span>
        </Alert>
      </div>
    </Modal>
  );
}
