import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  // the backend emails this link, so it must open without a session
  '/reset-password',
  '/doctors',
  '/chws',
  '/how-it-works',
  '/contact',
];

/** Route prefix -> role allowed to be there. */
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

  // Already logged in and sitting on login/register -> send to dashboard
  if (token && userRaw && (pathname === '/login' || pathname === '/register')) {
    try {
      const user = JSON.parse(userRaw);
      return NextResponse.redirect(new URL(DASHBOARDS[user.role] ?? '/', request.url));
    } catch {
      // fall through
    }
  }

  if (isPublic) return NextResponse.next();

  // Protected route with no token -> login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Right token, wrong role -> bounce to their own dashboard
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
