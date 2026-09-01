import { cn, fileUrl, initials } from '@/lib/utils';

const SIZES = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-20 w-20 text-xl',
};

export default function Avatar({
  name,
  src,
  size = 'md',
  tone = 'blue',
  className,
}: {
  name?: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  tone?: 'blue' | 'green' | 'purple';
  className?: string;
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  // callers hand us the raw stored path, so resolve it to the API origin here
  const resolved = fileUrl(src);

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={name ?? 'avatar'}
        className={cn('shrink-0 rounded-full object-cover', SIZES[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZES[size],
        name ? tones[tone] : 'bg-slate-100 text-transparent',
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
