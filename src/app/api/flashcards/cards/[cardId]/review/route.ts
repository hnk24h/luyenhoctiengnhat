import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

interface Ctx { params: Promise<{ cardId: string }> }

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
export async function POST(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const userId = user.id;

  const card = await prisma.flashcard.findFirst({
    where: { id: params.cardId, deck: { userId } },
    include: {
      progress: {
        where: { userId }, // FIXED: filter by userId after composite unique fix
      },
    },
  });
  if (!card) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  let body: { rating: 0 | 1 | 2 | 3 };
  try {
    body = await req.json() as { rating: 0 | 1 | 2 | 3 };
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { rating } = body;
  if (![0, 1, 2, 3].includes(rating)) {
    return apiError(ApiCode.VALIDATION, 'rating must be 0-3', 400);
  }

  const existing = card.progress[0] ?? null;
  const { repetitions, interval, easeFactor, dueAt } = computeNextSRS(
    rating,
    existing?.repetitions ?? 0,
    existing?.interval    ?? 1,
    existing?.easeFactor  ?? 2.5,
  );

  try {
    const progress = await prisma.flashcardProgress.upsert({
      where: { userId_cardId: { userId, cardId: params.cardId } },
      update: {
        repetitions,
        interval,
        easeFactor,
        dueAt,
        lastReview: new Date(),
        totalReviews: { increment: 1 },
      },
      create: {
        cardId: params.cardId,
        userId,
        repetitions,
        interval,
        easeFactor,
        dueAt,
        lastReview: new Date(),
        totalReviews: 1,
      },
    });

    return NextResponse.json({ progress, nextDue: dueAt });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}
