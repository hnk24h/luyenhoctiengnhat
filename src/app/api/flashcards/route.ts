import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/flashcards — list all decks for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const decks = await prisma.flashcardDeck.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { cards: true } },
      cards: {
        include: { progress: true },
        take: 0, // just for count via _count
      },
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
            { progress: null },
            { progress: { dueAt: { lte: now }, userId: user.id } },
          ],
        },
      });
      return { ...deck, dueCount };
    }),
  );

  return NextResponse.json(decksWithDue);
}

// POST /api/flashcards — create a new deck
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { title, description, color } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 });
  }

  const deck = await prisma.flashcardDeck.create({
    data: {
      userId: user.id,
      title:  title.trim(),
      description: description?.trim() || null,
      color:  color || '#4F46E5',
    },
  });

  return NextResponse.json(deck, { status: 201 });
}
