'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import MedicineCatalogue from '@/components/shared/MedicineCatalogue';

/**
 * Admins curate the catalogue but do not move stock - only a pharmacist can
 * PATCH /medicines/:id/stock, so the stock button is hidden rather than
 * offered and then rejected with a 403.
 */
export default function AdminMedicinesPage() {
  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Medicines"
        subtitle="Catalogue entries and their current stock levels."
      />
      <MedicineCatalogue onAdd={() => router.push('/admin/medicines/new')} />
    </>
  );
}
