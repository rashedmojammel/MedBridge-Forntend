'use client';

import { useParams } from 'next/navigation';
import PatientRecord from '@/components/shared/PatientRecord';



export default function ChwPatientPage() {
  const { id } = useParams<{ id: string }>();
  return <PatientRecord patientId={id} role="CHW" backHref="/chw/patients" />;
}
