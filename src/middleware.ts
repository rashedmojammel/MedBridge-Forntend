import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/doctors',
  '/chws',
  '/how-it-works',
  '/contact',
];

const ROLE_ROUTES: Record<string, string> = {
  '/patient': 'PATIENT',
  '/chw': 'CHW',
  '/doctor': 'DOCTOR',
  '/pharmacist': 'PHARMACIST',
  '/admin': 'ADMIN',
};

const DASHBOARDS: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  CHW: '/chw/dashboard',
  PATIENT: '/patient/dashboard',
  PHARMACIST: '/pharmacist/dashboard',
  STAFF: '/admin/dashboard',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('medbridge_token')?.value;
  const userRaw = request.cookies.get('medbridge_user')?.value;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(p)),
  );

  if (token && userRaw && (pathname === '/login' || pathname === '/register')) {
    try {
      const user = JSON.parse(userRaw);
      return NextResponse.redirect(new URL(DASHBOARDS[user.role] ?? '/', request.url));
    } catch {
    }
  }

  if (isPublic) return NextResponse.next();

  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (userRaw) {
    try {
      const user = JSON.parse(userRaw);
      for (const [prefix, role] of Object.entries(ROLE_ROUTES)) {
        if (pathname.startsWith(prefix) && user.role !== role) {
          return NextResponse.redirect(
            new URL(DASHBOARDS[user.role] ?? '/login', request.url),
          );
        }
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
