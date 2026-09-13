import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="p-5">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-blue-600">
          <Image src="/medbridge-icon.png" alt="Medbridge" width={50} height={50} />
          Medbridge
        </Link>
      </div>
      <main className="flex flex-1 items-center justify-center px-4 pb-12">{children}</main>
    </div>
  );
}