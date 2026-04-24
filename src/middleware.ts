import { type NextRequest, NextResponse } from 'next/server';

import { decodeJwt } from 'jose';

const PROTECTED_PREFIXES = ['/agent', '/portal'];
const PUBLIC_PATHS = ['/login', '/scan-qr'];
const AUTH_COOKIE = 'auth_token';

type VerifyResult =
  | { ok: true; payload: ReturnType<typeof decodeJwt> }
  | { ok: false; reason: 'expired' | 'invalid' };

/**
 * Token do backend ngoài cấp (HS256, secret không share ra client/edge),
 * nên ở đây CHỈ decode + check `exp`. Backend là source-of-truth:
 * request với token giả/hết hạn sẽ bị API trả 401 và client xử lý logout.
 */
function verifyToken(token: string): VerifyResult {
  try {
    const payload = decodeJwt(token);
    if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
      return { ok: false, reason: 'expired' };
    }
    return { ok: true, payload };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}

function redirectToLogin(
  request: NextRequest,
  params: Record<string, string>,
  clearCookie = false,
) {
  const loginUrl = new URL('/login', request.url);
  Object.entries(params).forEach(([k, v]) => loginUrl.searchParams.set(k, v));
  const res = NextResponse.redirect(loginUrl);
  if (clearCookie) {
    res.cookies.set(AUTH_COOKIE, '', { path: '/', maxAge: 0 });
  }
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return redirectToLogin(request, { redirect: pathname });
  }

  const result = verifyToken(token);

  if (!result.ok) {
    if (result.reason === 'expired') {
      return redirectToLogin(request, { expired: 'true', redirect: pathname }, true);
    }
    return redirectToLogin(request, { invalid: 'true', redirect: pathname }, true);
  }

  // Forward claims xuống RSC / Route Handler qua request header.
  const headers = new Headers(request.headers);
  if (typeof result.payload.sub === 'string') {
    headers.set('x-user-id', result.payload.sub);
  }
  const agentCode = result.payload['agentCode'];
  if (typeof agentCode === 'string') {
    headers.set('x-agent-code', agentCode);
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/agent/:path*', '/portal/:path*'],
};
