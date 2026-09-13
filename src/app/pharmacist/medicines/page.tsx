'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import MedicineCatalogue from '@/components/shared/MedicineCatalogue';


export default function PharmacistMedicinesPage() {
  const router = useRouter();

  
  return (
    <>
      <PageHeader
        title="Medicines"
        subtitle="The catalogue you dispense from. Adjust stock and retire items here."
      />
      <MedicineCatalogue
        canAdjustStock
        onAdd={() => router.push('/pharmacist/medicines/new')}
      />
    </>
  );
}
