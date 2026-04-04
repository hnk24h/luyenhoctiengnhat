import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

interface Ctx { params: Promise<{ deckId: string }> }

async function getAuthorizedDeck(deckId: string, userId: string) {
  const deck = await prisma.flashcardDeck.findFirst({ where: { id: deckId, userId } });
  return deck ? { deck, userId } : null;
}

// GET /api/flashcards/[deckId] — deck + all cards with progress
export async function GET(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const auth = await getAuthorizedDeck(params.deckId, user.id);
  if (!auth) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  try {
    const deck = await prisma.flashcardDeck.findUnique({
      where: { id: params.deckId },
      include: {
        cards: {
          include: { progress: { where: { userId: auth.userId } } },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Normalize: progress[] → progress (single, for this user) for backward compat
    const normalized = {
      ...deck,
      cards: deck?.cards.map(c => ({ ...c, progress: c.progress[0] ?? null })) ?? [],
    };
    return NextResponse.json(normalized);
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}

// PUT /api/flashcards/[deckId] — update deck meta
export async function PUT(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const auth = await getAuthorizedDeck(params.deckId, user.id);
  if (!auth) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  let body: { title?: string; description?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { title, description, color } = body;
  try {
    const deck = await prisma.flashcardDeck.update({
      where: { id: params.deckId },
      data: {
        title:  title?.trim() || auth.deck.title,
        description: description ?? auth.deck.description,
        color:  color || auth.deck.color,
      },
    });
    return NextResponse.json(deck);
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}

// DELETE /api/flashcards/[deckId]
export async function DELETE(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const auth = await getAuthorizedDeck(params.deckId, user.id);
  if (!auth) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  try {
    await prisma.flashcardDeck.delete({ where: { id: params.deckId } });
    return NextResponse.json({ ok: true });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}
