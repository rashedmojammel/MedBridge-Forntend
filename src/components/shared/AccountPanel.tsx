'use client';

import { useRef, useState } from 'react';
import { Camera, KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/shared/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge, { RoleBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';
import { useChangePassword, useCurrentUser } from '@/hooks/useAuth';
import { useUploadPhoto } from '@/hooks/useUsers';
import { saveUser } from '@/lib/auth';
import { apiError } from '@/lib/api';


export default function AccountPanel() {
  const { toast } = useToast();
  const user = useCurrentUser();
  const uploadPhoto = useUploadPhoto();
  const changePassword = useChangePassword();
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('account');
  const tc = useTranslations('common');

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const onPickPhoto = (file?: File) => {
    if (!file || !user) return;
    uploadPhoto.mutate(
      { id: user.id, file },
      {
        onSuccess: (updated) => {
          saveUser({ ...user, profileImage: updated.profileImage });
          toast(t('photoUpdated'));
        },
        onError: (e) => toast(apiError(e, t('photoFailed')), 'error'),
      },
    );
  };

  const onChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next.length < 6) return setError(t('vMin'));
    if (next !== confirm) return setError(t('vMismatch'));
    if (next === current) return setError(t('vSame'));

    changePassword.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: (message) => {
          toast(message);
          setCurrent('');
          setNext('');
          setConfirm('');
        },
        onError: (err) => setError(apiError(err, t('failed'))),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={tc('myAccount')} subtitle={t('subtitle')} />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={user?.fullName} src={user?.profileImage} size="xl" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-slate-900">
              {user?.fullName ?? tc('dash')}
            </p>
            <p className="truncate text-sm text-slate-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <RoleBadge role={user?.role} />
              {user?.phone && <Badge tone="gray">{user.phone}</Badge>}
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
              {t('changePhoto')}
            </Button>
            <p className="mt-1.5 text-center text-[11px] text-slate-400">{t('photoHint')}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title={t('changePassword')} />
        <form onSubmit={onChangePassword} className="space-y-4">
          {error && (
            <Alert tone="danger" className="rounded-lg">
              {error}
            </Alert>
          )}
          <Input
            label={t('currentPassword')}
            type="password"
            required
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('newPassword')}
              type="password"
              required
              autoComplete="new-password"
              hint={t('passwordHint')}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <Input
              label={t('confirmPassword')}
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={changePassword.isPending}>
              <KeyRound className="h-4 w-4" aria-hidden />
              {t('update')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
