/**
 * api-auth.ts
 * Dual-mode auth helper — works for both web (cookie) and mobile (Bearer token).
 *
 * Web:    Next.js sets `next-auth.session-token` cookie automatically.
 * Mobile: Pass `Authorization: Bearer <jwt>` header from the app.
 *
 * Usage in any route handler:
 *   const user = await getApiUser(req);
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from './auth';

export interface ApiUser {
  id: string;
  role: string;
  email?: string | null;
  name?: string | null;
}

/**
 * Returns the authenticated user from either cookie session (web) or
 * Authorization Bearer token (mobile). Returns null if not authenticated.
 */
export async function getApiUser(req: NextRequest): Promise<ApiUser | null> {
  // Try Bearer header first — used by mobile clients
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (token?.id) {
      return {
        id: token.id as string,
        role: (token.role as string) ?? 'user',
      };
    }
    return null;
  }

  // Fall back to cookie session — used by web browser
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    role: session.user.role ?? 'user',
    email: session.user.email,
    name: session.user.name,
  };
}

/**
 * Convenience: returns only the userId string or null.
 * Replaces the common `const user = await prisma.user.findUnique({ where: { email } })`
 * pattern in protected routes.
 */
export async function getApiUserId(req: NextRequest): Promise<string | null> {
  const user = await getApiUser(req);
  return user?.id ?? null;
}
