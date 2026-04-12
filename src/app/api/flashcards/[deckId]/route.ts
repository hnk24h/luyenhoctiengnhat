import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

interface Ctx { params: Promise<{ deckId: string }> }

async function getAuthorizedDeck(deckId: string, userId: string) {
  const deck = await prisma.flashcardDeck.findFirst({ where: { id: deckId, userId } });
  return deck ? { deck, userId } : null;
}

/** Check if user can read (view/study) this deck: owner, public, or specifically shared */
async function canReadDeck(deckId: string, userId: string) {
  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
  if (!deck) return null;
  if (deck.userId === userId) return { deck, isOwner: true };
  if (deck.shareMode === 'public') return { deck, isOwner: false };
  if (deck.shareMode === 'specific') {
    const share = await prisma.deckShare.findUnique({ where: { deckId_targetId: { deckId, targetId: userId } } });
    if (share) return { deck, isOwner: false };
  }
  return null;
}

// GET /api/flashcards/[deckId] — deck + all cards with progress (owner or shared)
export async function GET(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const access = await canReadDeck(params.deckId, user.id);
  if (!access) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  try {
    const deck = await prisma.flashcardDeck.findUnique({
      where: { id: params.deckId },
      include: {
        user: { select: { id: true, name: true, image: true } },
        cards: {
          include: { progress: { where: { userId: user.id } } },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Normalize: progress[] → progress (single, for this user) for backward compat
    const normalized = {
      ...deck,
      isOwner: access.isOwner,
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
