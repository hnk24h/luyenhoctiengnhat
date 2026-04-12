import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

/**
 * GET /api/flashcards/shared — list decks shared with current user
 * Returns: public decks + specifically shared decks (excluding own decks)
 * Query params: ?search=keyword
 */
export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim() || '';

  const titleFilter = search ? { title: { contains: search, mode: 'insensitive' as const } } : {};

  // Fetch: (1) public decks from others + (2) specifically shared with me
  const [publicDecks, sharedWithMe] = await Promise.all([
    prisma.flashcardDeck.findMany({
      where: {
        shareMode: 'public',
        userId: { not: user.id },
        ...titleFilter,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { cards: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.flashcardDeck.findMany({
      where: {
        shareMode: 'specific',
        userId: { not: user.id },
        shares: { some: { targetId: user.id } },
        ...titleFilter,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { cards: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
  ]);

  // Merge + deduplicate
  const seen = new Set<string>();
  const all = [...sharedWithMe, ...publicDecks].filter(d => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });

  return NextResponse.json(all);
}
