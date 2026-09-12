'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import MedicineCatalogue from '@/components/shared/MedicineCatalogue';
 

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
