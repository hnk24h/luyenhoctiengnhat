/**
 * POST /api/auth/mobile/token
 * Mobile login — validates credentials and returns a signed JWT.
 * The JWT is the same NextAuth JWT, so it works with getApiUser() on every route.
 *
 * Request body: { email: string, password: string }
 * Response 200: { token: string, user: { id, name, email, role } }
 * Response 400: { error: string }
 * Response 401: { error: string }
 * Response 429: { error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { apiError, ApiCode } from '@/lib/api-response';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? 'fallback-secret-change-me'
);

// Token valid for 30 days — matches NextAuth default session maxAge
const TOKEN_EXPIRES_IN = '30d';

// ── In-memory rate limiter: max 5 attempts per IP per 15 minutes ──────────
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX       = 5;
const rateLimitMap   = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return apiError(ApiCode.RATE_LIMITED, 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.', 429);
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { email, password } = body;
  if (!email || !password) {
    return apiError(ApiCode.VALIDATION, 'Email và mật khẩu là bắt buộc.', 400);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return apiError(ApiCode.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng.', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return apiError(ApiCode.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng.', 401);
    }

    // Sign a JWT with the same payload structure NextAuth uses
    const token = await new SignJWT({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      // NextAuth compat fields
      sub: user.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRES_IN)
      .sign(JWT_SECRET);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Lỗi máy chủ.', 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
