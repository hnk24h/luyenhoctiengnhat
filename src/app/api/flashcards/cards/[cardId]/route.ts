import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: { cardId: string } }

async function getAuthorizedCard(cardId: string, userEmail: string) {
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return null;
  const card = await prisma.flashcard.findFirst({
    where: { id: cardId, deck: { userId: user.id } },
  });
  return card ? { card, user } : null;
}

// PUT /api/flashcards/cards/[cardId]
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthorizedCard(params.cardId, session.user.email);
  if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { front, back, reading, example, imageUrl } = await req.json();
  const card = await prisma.flashcard.update({
    where: { id: params.cardId },
    data: {
      front:    front?.trim()    || auth.card.front,
      back:     back?.trim()     || auth.card.back,
      reading:  reading?.trim()  ?? auth.card.reading,
      example:  example?.trim()  ?? auth.card.example,
      imageUrl: imageUrl !== undefined ? (imageUrl?.trim() || null) : auth.card.imageUrl,
    },
    include: { progress: true },
  });
  return NextResponse.json(card);
}

// DELETE /api/flashcards/cards/[cardId]
export async function DELETE(_: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthorizedCard(params.cardId, session.user.email);
  if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.flashcard.delete({ where: { id: params.cardId } });
  return NextResponse.json({ ok: true });
}
