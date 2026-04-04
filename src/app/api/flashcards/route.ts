import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/flashcards — list all decks for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const decks = await prisma.flashcardDeck.findMany({
      where: { userId },
      include: {
        _count: { select: { cards: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

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

    return NextResponse.json(decksWithDue);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/flashcards — create a new deck
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { title?: string; description?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, description, color } = body;
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
