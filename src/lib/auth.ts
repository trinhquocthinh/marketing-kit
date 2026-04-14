import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return false;
  return decoded.exp * 1000 > Date.now();
}
