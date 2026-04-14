import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/agent', '/portal'];
const PUBLIC_PATHS = ['/login', '/scan-qr'];
const AUTH_COOKIE = 'auth_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic JWT expiry check (decode payload without verification — server will verify)
  try {
    const payloadStr = atob(token.split('.')[1]);
    const payload = JSON.parse(payloadStr);
    const exp = payload.exp;
    if (exp && Date.now() >= exp * 1000) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('expired', 'true');
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Malformed token — let the API handle it
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/agent/:path*', '/portal/:path*'],
};
