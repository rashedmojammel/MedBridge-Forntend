import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

type Tone = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'yellow' | 'gray';

const TONES: Record<Tone, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  orange: 'bg-orange-50 text-orange-700',
  purple: 'bg-purple-50 text-purple-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  gray: 'bg-slate-100 text-slate-600',
};

export default function Badge({
  tone = 'gray',
  children,
  className,
  dot = false,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}


export function StatusBadge({ status }: { status?: string }) {
  const t = useTranslations('enums.status');
  const map: Record<string, Tone> = {
    SCHEDULED: 'blue',
    IN_PROGRESS: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'gray',
    CRITICAL: 'red',
    NON_CRITICAL: 'yellow',
    ACTIVE: 'green',
    MILD: 'green',
    MODERATE: 'orange',
    SEVERE: 'red',
  };
  if (!status) return null;
  const tone = map[status] ?? 'gray';
  
  const label = t.has(status) ? t(status) : status.replace(/_/g, ' ');
  return (
    <Badge tone={tone} dot={status === 'CRITICAL'}>
      {label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role?: UserRole }) {
  const t = useTranslations('enums.role');
  const map: Record<UserRole, Tone> = {
    ADMIN: 'red',
    DOCTOR: 'blue',
    CHW: 'purple',
    PATIENT: 'gray',
    PHARMACIST: 'orange',
    STAFF: 'green',
  };
  if (!role) return null;
  return <Badge tone={map[role]}>{t.has(role) ? t(role) : role}</Badge>;
}
