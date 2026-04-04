import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: Promise<{ deckId: string }> }

// POST /api/flashcards/[deckId]/cards — add a card to a deck
export async function POST(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const deck = await prisma.flashcardDeck.findFirst({ where: { id: params.deckId, userId } });
  if (!deck) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { front?: string; back?: string; reading?: string; example?: string; imageUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { front, back, reading, example, imageUrl } = body;
  if (!front?.trim() || !back?.trim()) {
    return NextResponse.json({ error: 'front and back are required' }, { status: 400 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
