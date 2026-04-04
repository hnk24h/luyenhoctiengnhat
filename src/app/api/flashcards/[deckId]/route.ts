import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: Promise<{ deckId: string }> }

async function getAuthorizedDeck(deckId: string, userId: string) {
  const deck = await prisma.flashcardDeck.findFirst({ where: { id: deckId, userId } });
  return deck ? { deck, userId } : null;
}

// GET /api/flashcards/[deckId] — deck + all cards with progress
export async function GET(_: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthorizedDeck(params.deckId, session.user.id);
  if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/flashcards/[deckId] — update deck meta
export async function PUT(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthorizedDeck(params.deckId, session.user.id);
  if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { title?: string; description?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/flashcards/[deckId]
export async function DELETE(_: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthorizedDeck(params.deckId, session.user.id);
  if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await prisma.flashcardDeck.delete({ where: { id: params.deckId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
