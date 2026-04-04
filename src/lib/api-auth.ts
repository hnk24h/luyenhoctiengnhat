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
import { jwtVerify } from 'jose';
import { authOptions } from './auth';

export interface ApiUser {
  id: string;
  role: string;
  email?: string | null;
  name?: string | null;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? 'fallback-secret-change-me'
);

/**
 * Returns the authenticated user from either cookie session (web) or
 * Authorization Bearer token (mobile). Returns null if not authenticated.
 */
export async function getApiUser(req: NextRequest): Promise<ApiUser | null> {
  // Try Bearer header first — used by mobile clients
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const rawToken = authHeader.slice(7).trim();
    try {
      const { payload } = await jwtVerify(rawToken, JWT_SECRET);
      const id = (payload.id ?? payload.sub) as string | undefined;
      if (!id) return null;
      return {
        id,
        role: (payload.role as string) ?? 'user',
        email: payload.email as string | null,
        name: payload.name as string | null,
      };
    } catch {
      // Invalid / expired token
      return null;
    }
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
 */
export async function getApiUserId(req: NextRequest): Promise<string | null> {
  const user = await getApiUser(req);
  return user?.id ?? null;
}
