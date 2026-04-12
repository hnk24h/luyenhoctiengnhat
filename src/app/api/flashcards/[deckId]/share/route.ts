import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

interface Ctx { params: Promise<{ deckId: string }> }

/**
 * GET /api/flashcards/[deckId]/share — get share info for a deck
 * Returns { shareMode, shares: [{ id, target: { id, name, email, image } }] }
 */
export async function GET(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const deck = await prisma.flashcardDeck.findFirst({
    where: { id: params.deckId, userId: user.id },
    select: {
      id: true, shareMode: true,
      shares: {
        select: {
          id: true,
          target: { select: { id: true, name: true, email: true, image: true } },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!deck) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  return NextResponse.json(deck);
}

/**
 * PUT /api/flashcards/[deckId]/share — update share mode
 * Body: { shareMode: "private" | "public" | "specific" }
 */
export async function PUT(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const deck = await prisma.flashcardDeck.findFirst({ where: { id: params.deckId, userId: user.id } });
  if (!deck) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  const body = await req.json();
  const { shareMode } = body;

  if (!['private', 'public', 'specific'].includes(shareMode)) {
    return apiError(ApiCode.VALIDATION, 'shareMode must be private, public, or specific', 400);
  }

  const updated = await prisma.flashcardDeck.update({
    where: { id: params.deckId },
    data: { shareMode },
    select: { id: true, shareMode: true },
  });

  // If switching to private, remove all shares
  if (shareMode === 'private') {
    await prisma.deckShare.deleteMany({ where: { deckId: params.deckId } });
  }

  return NextResponse.json(updated);
}

/**
 * POST /api/flashcards/[deckId]/share — share with specific user(s)
 * Body: { emails: string[] }
 * Adds shares for the given email addresses. Sets shareMode to "specific" if currently private.
 */
export async function POST(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const deck = await prisma.flashcardDeck.findFirst({ where: { id: params.deckId, userId: user.id } });
  if (!deck) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  const body = await req.json();
  const emails: string[] = body.emails;

  if (!Array.isArray(emails) || emails.length === 0) {
    return apiError(ApiCode.VALIDATION, 'emails must be a non-empty array', 400);
  }

  // Find target users by email (exclude owner)
  const targets = await prisma.user.findMany({
    where: { email: { in: emails }, id: { not: user.id } },
    select: { id: true, email: true, name: true, image: true },
  });

  if (targets.length === 0) {
    return apiError(ApiCode.VALIDATION, 'Không tìm thấy user nào với email đã nhập', 400);
  }

  // Create shares (skipDuplicates for idempotency)
  await prisma.deckShare.createMany({
    data: targets.map(t => ({
      deckId: params.deckId,
      ownerId: user.id,
      targetId: t.id,
    })),
    skipDuplicates: true,
  });

  // Auto-set mode to specific if currently private
  if (deck.shareMode === 'private') {
    await prisma.flashcardDeck.update({
      where: { id: params.deckId },
      data: { shareMode: 'specific' },
    });
  }

  // Return updated share list
  const updated = await prisma.flashcardDeck.findUnique({
    where: { id: params.deckId },
    select: {
      id: true, shareMode: true,
      shares: {
        select: {
          id: true,
          target: { select: { id: true, name: true, email: true, image: true } },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/flashcards/[deckId]/share — remove specific share(s)
 * Body: { shareIds: string[] } or { targetIds: string[] }
 */
export async function DELETE(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const deck = await prisma.flashcardDeck.findFirst({ where: { id: params.deckId, userId: user.id } });
  if (!deck) return apiError(ApiCode.NOT_FOUND, 'Not found', 404);

  const body = await req.json();

  if (body.shareIds?.length) {
    await prisma.deckShare.deleteMany({
      where: { id: { in: body.shareIds }, deckId: params.deckId },
    });
  } else if (body.targetIds?.length) {
    await prisma.deckShare.deleteMany({
      where: { targetId: { in: body.targetIds }, deckId: params.deckId },
    });
  }

  return NextResponse.json({ message: 'Đã xóa.' });
}
