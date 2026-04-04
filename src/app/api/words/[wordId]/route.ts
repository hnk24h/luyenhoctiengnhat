import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

interface Ctx { params: Promise<{ wordId: string }> }

// DELETE /api/words/[wordId]
export async function DELETE(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  try {
    const word = await prisma.savedWord.findFirst({ where: { id: params.wordId, userId: user.id } });
    if (!word) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

    await prisma.savedWord.delete({ where: { id: params.wordId } });
    return NextResponse.json({ ok: true });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}
