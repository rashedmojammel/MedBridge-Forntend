import { AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'danger' | 'warning' | 'info' | 'success';

const CONFIG: Record<Tone, { bg: string; border: string; text: string; Icon: any }> = {
  danger: {
    bg: 'bg-red-50',
    border: 'border-l-red-600',
    text: 'text-red-800',
    Icon: AlertCircle,
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-l-orange-500',
    text: 'text-orange-800',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-l-blue-600',
    text: 'text-blue-800',
    Icon: Info,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-l-green-600',
    text: 'text-green-800',
    Icon: CheckCircle2,
  },
};

export default function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { bg, border, text, Icon } = CONFIG[tone];
  return (
    <div
      className={cn('flex items-start gap-3 border-l-4 p-4', bg, border, text, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5')}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
