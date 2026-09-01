'use client';

import { useParams } from 'next/navigation';
import PatientRecord from '@/components/shared/PatientRecord';

export default function DoctorPatientPage() {
  const { id } = useParams<{ id: string }>();
  return <PatientRecord patientId={id} role="DOCTOR" backHref="/doctor/patients" />;
}
