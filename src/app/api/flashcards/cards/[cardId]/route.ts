import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

interface Ctx { params: Promise<{ cardId: string }> }

async function getAuthorizedCard(cardId: string, userId: string) {
  const card = await prisma.flashcard.findFirst({
    where: { id: cardId, deck: { userId } },
  });
  return card ? { card, userId } : null;
}

// PUT /api/flashcards/cards/[cardId]
export async function PUT(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const auth = await getAuthorizedCard(params.cardId, user.id);
  if (!auth) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  let body: { front?: string; back?: string; reading?: string; example?: string; imageUrl?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { front, back, reading, example, imageUrl } = body;

  try {
    const card = await prisma.flashcard.update({
      where: { id: params.cardId },
      data: {
        front:    front?.trim()    || auth.card.front,
        back:     back?.trim()     || auth.card.back,
        reading:  reading?.trim()  ?? auth.card.reading,
        example:  example?.trim()  ?? auth.card.example,
        imageUrl: imageUrl !== undefined ? (imageUrl?.trim() || null) : auth.card.imageUrl,
      },
      include: { progress: { where: { userId: auth.userId } } },
    });
    const normalized = { ...card, progress: card.progress[0] ?? null };
    return NextResponse.json(normalized);
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}

// DELETE /api/flashcards/cards/[cardId]
export async function DELETE(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const auth = await getAuthorizedCard(params.cardId, user.id);
  if (!auth) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  try {
    await prisma.flashcard.delete({ where: { id: params.cardId } });
    return NextResponse.json({ ok: true });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}
