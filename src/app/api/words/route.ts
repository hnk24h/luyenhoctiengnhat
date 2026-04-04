import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

// GET /api/words — list user's saved words (with linked Content + meanings)
// Supports optional pagination: ?page=1&limit=20 (mobile)
export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const userId = user.id;

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const paginated = limitParam !== null;
  const limit = Math.min(Math.max(parseInt(limitParam ?? '20', 10) || 20, 1), 100);
  const page  = Math.max(parseInt(searchParams.get('page') ?? '1', 10) || 1, 1);

  try {
    const [words, total] = await Promise.all([
      prisma.savedWord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          content: {
            select: {
              id: true, term: true, pronunciation: true, language: true,
              meanings: { select: { language: true, meaning: true } },
              examples: { select: { exampleText: true, translation: true } },
            },
          },
          collections: {
            select: { collection: { select: { id: true, name: true, color: true } } },
          },
        },
        ...(paginated ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
      paginated ? prisma.savedWord.count({ where: { userId } }) : Promise.resolve(0),
    ]);

    const mapped = words.map(w => ({
      ...w,
      collections: w.collections.map(c => c.collection),
    }));

    if (paginated) {
      return NextResponse.json({ data: mapped, total, page, limit, hasMore: page * limit < total });
    }
    return NextResponse.json(mapped);
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}

// POST /api/words — save a word by contentId
export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const userId = user.id;

  let body: { contentId?: string; context?: string; term?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { contentId, context } = body;

  // support legacy callers that send `term` — look up Content by term
  let resolvedContentId: string | undefined = contentId;
  if (!resolvedContentId) {
    const { term } = body;
    if (!term?.trim()) return apiError(ApiCode.VALIDATION, 'contentId hoặc term là bắt buộc', 400);
    const found = await prisma.content.findFirst({ where: { term: term.trim() } });
    if (!found) return apiError(ApiCode.NOT_FOUND, 'Từ này chưa có trong hệ thống học tập', 404);
    resolvedContentId = found.id;
  }

  try {
    const word = await prisma.savedWord.upsert({
      where: { userId_contentId: { userId, contentId: resolvedContentId } },
      update: { context: context?.trim() || null },
      create: { userId, contentId: resolvedContentId, context: context?.trim() || null },
      include: {
        content: { select: { term: true, pronunciation: true, meanings: { select: { language: true, meaning: true } } } },
      },
    });
    return NextResponse.json(word, { status: 201 });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}
