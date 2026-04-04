import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

interface Ctx { params: Promise<{ deckId: string }> }

// POST /api/flashcards/[deckId]/cards — add a card to a deck
export async function POST(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const userId = user.id;

  const deck = await prisma.flashcardDeck.findFirst({ where: { id: params.deckId, userId } });
  if (!deck) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  let body: { front?: string; back?: string; reading?: string; example?: string; imageUrl?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { front, back, reading, example, imageUrl } = body;
  if (!front?.trim() || !back?.trim()) {
    return apiError(ApiCode.VALIDATION, 'front and back are required', 400);
  }

  try {
    const count = await prisma.flashcard.count({ where: { deckId: deck.id } });

    const card = await prisma.flashcard.create({
      data: {
        deckId:   deck.id,
        front:    front.trim(),
        back:     back.trim(),
        reading:  reading?.trim() || null,
        example:  example?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        order:    count,
      },
      include: { progress: { where: { userId } } },
    });

    const normalized = { ...card, progress: card.progress[0] ?? null };
    return NextResponse.json(normalized, { status: 201 });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}
