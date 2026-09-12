import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="p-5">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-blue-600">
          <HeartPulse className="h-5 w-5" aria-hidden />
          Medbridge
          
        </Link>
      </div>
      <main className="flex flex-1 items-center justify-center px-4 pb-12">{children}</main>
    </div>
  );
}
