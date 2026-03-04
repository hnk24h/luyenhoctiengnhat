import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: { deckId: string } }

// POST /api/flashcards/[deckId]/import
// Body: { cards: [{ front, back, reading?, example? }] }
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const deck = await prisma.flashcardDeck.findFirst({ where: { id: params.deckId, userId: user.id } });
  if (!deck) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const cards: { front: string; back: string; reading?: string; example?: string }[] = body.cards;

  if (!Array.isArray(cards) || cards.length === 0) {
    return NextResponse.json({ error: 'cards must be a non-empty array' }, { status: 400 });
  }

  // Validate each card
  const valid = cards.filter(c => typeof c.front === 'string' && c.front.trim() &&
                                   typeof c.back  === 'string' && c.back.trim());
  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid cards found (front and back are required)' }, { status: 400 });
  }

  // Get current card count for ordering
  const startOrder = await prisma.flashcard.count({ where: { deckId: deck.id } });

  await prisma.flashcard.createMany({
    data: valid.map((c, i) => ({
      deckId:  deck.id,
      front:   c.front.trim(),
      back:    c.back.trim(),
      reading: c.reading?.trim() || null,
      example: c.example?.trim() || null,
      order:   startOrder + i,
    })),
  });

  return NextResponse.json({ imported: valid.length }, { status: 201 });
}
