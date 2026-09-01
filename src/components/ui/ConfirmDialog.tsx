'use client';

import { useTranslations } from 'next-intl';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  loading = false,
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  danger?: boolean;
}) {
  // defaults live here, not in the parameter list: a hook cannot run there
  const t = useTranslations('common');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? t('areYouSure')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel ?? t('confirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{description}</p>
    </Modal>
  );
}
