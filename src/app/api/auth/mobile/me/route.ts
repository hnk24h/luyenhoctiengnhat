/**
 * GET /api/auth/mobile/me
 * Returns the authenticated user's info from a Bearer token.
 * Mobile clients can call this to verify their token is still valid.
 *
 * Request headers: Authorization: Bearer <jwt>
 * Response 200: { user: { id, name, email, role } }
 * Response 401: { error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { apiError, ApiCode } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
