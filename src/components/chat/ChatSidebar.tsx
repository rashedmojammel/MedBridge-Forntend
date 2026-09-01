'use client';

import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import VitalChip from '@/components/shared/VitalChip';
import { useVitalTone } from '@/hooks/useTriage';
import { useFormat } from '@/hooks/useFormat';
import { ageFrom } from '@/lib/utils';
import type { Patient, VitalSigns, SymptomReport } from '@/types';

export default function ChatSidebar({
  patient,
  vitals,
  report,
  children,
}: {
  patient?: Patient;
  vitals?: VitalSigns;
  report?: SymptomReport;
  children?: React.ReactNode;
}) {
  // colours follow the admin-tunable thresholds, same as the triage screen
  const { tone } = useVitalTone();
  const tc = useTranslations('common');
  const tv = useTranslations('vitals');
  const tg = useTranslations('enums.gender');
  const tsym = useTranslations('enums.symptom');
  const f = useFormat();

  const age = ageFrom(patient?.dob);

  return (
    <aside className="scrollbar-thin hidden w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4 lg:block">
      <section className="mb-5">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {tc('patient')}
        </h3>
        <p className="text-sm font-semibold text-slate-900">{patient?.fullName}</p>
        <p className="font-mono text-xs text-slate-500">{f.digits(patient?.mrn)}</p>
        <dl className="mt-3 space-y-1.5 text-xs">
          {[
            [tc('age'), age != null ? f.num(age) : tc('dash')],
            [
              tc('gender'),
              patient?.gender && tg.has(patient.gender)
                ? tg(patient.gender)
                : (patient?.gender ?? tc('dash')),
            ],
            [tc('bloodGroup'), patient?.bloodGroup ?? tc('dash')],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-slate-100 pb-1.5">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-medium text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {patient?.allergies && (
        <section className="mb-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {tc('allergies')}
          </h3>
          <Badge tone="red">{patient.allergies}</Badge>
        </section>
      )}

      {vitals && (
        <section className="mb-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {tv('latest')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <VitalChip
              label={tv('temperature')}
              value={vitals.temperature}
              unit="°C"
              tone={tone('temperature', vitals.temperature)}
            />
            <VitalChip
              label={tv('bloodPressure')}
              value={`${vitals.bpSystolic}/${vitals.bpDiastolic}`}
              tone={tone('bpSystolic', vitals.bpSystolic)}
            />
            <VitalChip
              label={tv('pulse')}
              value={vitals.pulse}
              unit="bpm"
              tone={tone('pulse', vitals.pulse)}
            />
            <VitalChip
              label={tv('spo2')}
              value={vitals.spo2}
              unit="%"
              tone={tone('spo2', vitals.spo2)}
            />
          </div>
        </section>
      )}

      {report && (
        <section className="mb-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {tc('symptoms')}
          </h3>
          <p className="text-sm text-slate-700">{report.primaryComplaint}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(report.symptoms ?? []).map((s) => (
              <Badge key={s} tone="gray">
                {tsym.has(s) ? tsym(s) : s}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {children}
    </aside>
  );
}
