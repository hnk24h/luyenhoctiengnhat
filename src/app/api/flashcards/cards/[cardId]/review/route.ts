import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: { cardId: string } }

// Rating: 0=Again, 1=Hard, 2=Good, 3=Easy
function computeNextSRS(
  rating: 0 | 1 | 2 | 3,
  repetitions: number,
  interval: number,
  easeFactor: number,
) {
  let newRep = repetitions;
  let newInterval = interval;
  let newEase = easeFactor;

  if (rating === 0) {
    // Again: reset
    newRep = 0;
    newInterval = 1;
  } else if (rating === 1) {
    // Hard: small bump, decrease ease
    newEase = Math.max(1.3, easeFactor - 0.15);
    newInterval = Math.max(1, Math.round(interval * 1.2));
    newRep = repetitions + 1;
  } else if (rating === 2) {
    // Good: normal progression
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 4;
    else newInterval = Math.round(interval * easeFactor);
    newRep = repetitions + 1;
  } else {
    // Easy: big jump, increase ease
    newEase = Math.min(3.0, easeFactor + 0.15);
    if (repetitions === 0) newInterval = 4;
    else newInterval = Math.round(interval * easeFactor * 1.3);
    newRep = repetitions + 1;
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + newInterval);

  return { repetitions: newRep, interval: newInterval, easeFactor: newEase, dueAt };
}

// POST /api/flashcards/cards/[cardId]/review
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const card = await prisma.flashcard.findFirst({
    where: { id: params.cardId, deck: { userId: user.id } },
    include: { progress: true },
  });
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { rating } = await req.json() as { rating: 0 | 1 | 2 | 3 };
  if (![0, 1, 2, 3].includes(rating)) {
    return NextResponse.json({ error: 'rating must be 0-3' }, { status: 400 });
  }

  const existing = card.progress;
  const { repetitions, interval, easeFactor, dueAt } = computeNextSRS(
    rating,
    existing?.repetitions ?? 0,
    existing?.interval    ?? 1,
    existing?.easeFactor  ?? 2.5,
  );

  const progress = await prisma.flashcardProgress.upsert({
    where: { cardId: params.cardId },
    update: {
      repetitions,
      interval,
      easeFactor,
      dueAt,
      lastReview: new Date(),
      totalReviews: { increment: 1 },
      userId: user.id,
    },
    create: {
      cardId: params.cardId,
      userId: user.id,
      repetitions,
      interval,
      easeFactor,
      dueAt,
      lastReview: new Date(),
      totalReviews: 1,
    },
  });

  return NextResponse.json({ progress, nextDue: dueAt });
}
