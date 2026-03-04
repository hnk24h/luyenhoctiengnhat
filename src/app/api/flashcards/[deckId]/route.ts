import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: { deckId: string } }

async function getAuthorizedDeck(deckId: string, userEmail: string) {
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return null;
  const deck = await prisma.flashcardDeck.findFirst({ where: { id: deckId, userId: user.id } });
  return deck ? { deck, user } : null;
}

// GET /api/flashcards/[deckId] — deck + all cards with progress
export async function GET(_: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthorizedDeck(params.deckId, session.user.email);
  if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: params.deckId },
    include: {
      cards: {
        include: { progress: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  return NextResponse.json(deck);
}

// PUT /api/flashcards/[deckId] — update deck meta
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthorizedDeck(params.deckId, session.user.email);
  if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { title, description, color } = await req.json();
  const deck = await prisma.flashcardDeck.update({
    where: { id: params.deckId },
    data: {
      title:  title?.trim() || auth.deck.title,
      description: description ?? auth.deck.description,
      color:  color || auth.deck.color,
    },
  });
  return NextResponse.json(deck);
}

// DELETE /api/flashcards/[deckId]
export async function DELETE(_: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthorizedDeck(params.deckId, session.user.email);
  if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.flashcardDeck.delete({ where: { id: params.deckId } });
  return NextResponse.json({ ok: true });
}
