import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Admin authentication for the /xiaozhouBackend contact-message console.
 * A signed JWT (role=admin) is issued on login and verified by every
 * /api/admin/* route via `requireAdmin`.
 */

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'change-me-admin-secret-qtechvending';

const ADMIN_TOKEN_TTL = '12h';

export interface AdminJwtPayload {
  sub: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** Sign a JWT for an authenticated admin. */
export function generateAdminToken(payload: { sub: string; username: string; role?: string }): string {
  return jwt.sign(
    { sub: payload.sub, username: payload.username, role: 'admin' },
    ADMIN_JWT_SECRET,
    { expiresIn: ADMIN_TOKEN_TTL }
  );
}

/** Verify a signed admin JWT and confirm the admin role. Returns null if invalid. */
export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as AdminJwtPayload;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

/** Extract the admin token from the Authorization header or `admin_auth` cookie. */
function extractAdminToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }
  const cookie = request.headers.get('cookie');
  if (cookie) {
    const match = cookie.match(/admin_auth=([^;]+)/);
    if (match && match[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }
  return null;
}

/** Server-side admin guard used by every /api/admin/* route. */
export async function requireAdmin(request: NextRequest): Promise<AdminJwtPayload | null> {
  const token = extractAdminToken(request);
  if (!token) return null;
  return verifyAdminToken(token);
}

/** Backwards-compatible boolean guard. */
export async function verifyAuth(request: NextRequest): Promise<boolean> {
  return (await requireAdmin(request)) !== null;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
}

export function notFoundResponse(resource: string = 'Resource') {
  return NextResponse.json({ error: `${resource} not found.` }, { status: 404 });
}

export function badRequestResponse(message: string = 'Bad request.') {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverErrorResponse(message: string = 'Internal server error.') {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Structured API error used by V52 endpoints. Returns `{ code, message }` with
 * the given HTTP status (default 400), matching the shared error contract in
 * architecture §7.4.
 */
export function apiError(code: string, message: string, status: number = 400) {
  return NextResponse.json({ code, message }, { status });
}
