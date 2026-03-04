import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: { deckId: string } }

// POST /api/flashcards/[deckId]/cards — add a card to a deck
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const deck = await prisma.flashcardDeck.findFirst({ where: { id: params.deckId, userId: user.id } });
  if (!deck) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { front, back, reading, example, imageUrl } = await req.json();
  if (!front?.trim() || !back?.trim()) {
    return NextResponse.json({ error: 'front and back are required' }, { status: 400 });
  }

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
    include: { progress: true },
  });

  return NextResponse.json(card, { status: 201 });
}
