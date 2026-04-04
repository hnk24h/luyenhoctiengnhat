import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

// GET /api/flashcards — list all decks for current user
// Supports optional pagination: ?page=1&limit=20 (mobile)
// Without ?limit returns all records (web backward compat)
export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);
  }
  const userId = user.id;

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const paginated = limitParam !== null;
  const limit = Math.min(Math.max(parseInt(limitParam ?? '20', 10) || 20, 1), 100);
  const page  = Math.max(parseInt(searchParams.get('page') ?? '1', 10) || 1, 1);

  try {
    const [decks, total] = await Promise.all([
      prisma.flashcardDeck.findMany({
        where: { userId },
        include: { _count: { select: { cards: true } } },
        orderBy: { updatedAt: 'desc' },
        ...(paginated ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
      paginated ? prisma.flashcardDeck.count({ where: { userId } }) : Promise.resolve(0),
    ]);

    // Attach due card count per deck
    const now = new Date();
    const decksWithDue = await Promise.all(
      decks.map(async (deck) => {
        const dueCount = await prisma.flashcard.count({
          where: {
            deckId: deck.id,
            OR: [
              { progress: { none: {} } },
              { progress: { some: { dueAt: { lte: now }, userId } } },
            ],
          },
        });
        return { ...deck, dueCount };
      }),
    );

    if (paginated) {
      return NextResponse.json({
        data: decksWithDue,
        total,
        page,
        limit,
        hasMore: page * limit < total,
      });
    }
    return NextResponse.json(decksWithDue);
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}

// POST /api/flashcards — create a new deck
export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);
  }
  const userId = user.id;

  let body: { title?: string; description?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { title, description, color } = body;
  if (!title?.trim()) {
    return apiError(ApiCode.VALIDATION, 'Title required', 400);
  }

  try {
    const deck = await prisma.flashcardDeck.create({
      data: {
        userId,
        title:  title.trim(),
        description: description?.trim() || null,
        color:  color || '#4F46E5',
      },
    });
    return NextResponse.json(deck, { status: 201 });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}
